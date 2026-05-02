import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { usePrimetimeState } from "@/hooks/usePrimetimeState";
import { useRecolorMap } from "@/hooks/useRecolorMap";
import { ControlRail } from "@/components/ControlRail";
import { BottomBar } from "@/components/BottomBar";
import { ImageUploader } from "@/components/ImageUploader";
import { PrimingZenithalPanel } from "@/components/panels/PrimingZenithalPanel";
import { ColorPlanPanel } from "@/components/panels/ColorPlanPanel";
import { BrushGuidePanel } from "@/components/panels/BrushGuidePanel";
import { PaintHandlingPanel } from "@/components/panels/PaintHandlingPanel";
import { PaintPlanPanel } from "@/components/panels/PaintPlanPanel";
import { FinishVarnishPanel } from "@/components/panels/FinishVarnishPanel";
import { extractDominantColors } from "@/lib/color-extraction";
import { processZenithalPreview } from "@/lib/zenithal-preview";
import { SPEEDPAINT_MOST_WANTED } from "@/data/speedpaints";
import { ColorScheme, ThemeId } from "@/types/primetime";
import {
  toBase64,
  analyseAnatomy,
  generateRepaint,
  generatePrimingRepaint,
  submitCustomRepaint,
} from "@/lib/gemini-pipeline";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  initDB,
  saveImage,
  loadImages,
  clearImages,
  saveRepaint,
  loadRepaints,
} from "@/lib/primetime-db";

async function compressBase64Image(
  base64: string,
  maxDimension = 1024,
  quality = 0.85,
): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/webp', quality);
      resolve({
        data: dataUrl.split(',')[1],
        mimeType: 'image/webp',
      });
    };
    img.src = `data:image/png;base64,${base64}`;
  });
}


function generateSchemes(
  extractedColors: string[],
  theme: ThemeId | null,
  baseOverride: string | null,
  midtoneOverrides: string[],
  highlightOverride: string | null,
): ColorScheme[] {
  const paints = SPEEDPAINT_MOST_WANTED;

  function closestPaint(hex: string) {
    let best = paints[0];
    let bestDist = Infinity;
    const [r, g, b] = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    for (const p of paints) {
      const [pr, pg, pb] = [
        parseInt(p.hex.slice(1, 3), 16),
        parseInt(p.hex.slice(3, 5), 16),
        parseInt(p.hex.slice(5, 7), 16),
      ];
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < bestDist) {
        best = p;
        bestDist = dist;
      }
    }
    return best;
  }

  const getBase = () => extractedColors[0] ? closestPaint(extractedColors[0]) : paints[8];
  const getMid1 = () => extractedColors[1] ? closestPaint(extractedColors[1]) : paints[7];
  const getMid2 = () => extractedColors[2] ? closestPaint(extractedColors[2]) : null;
  const getHigh = () => extractedColors[3] ? closestPaint(extractedColors[3]) : paints[23];

  const s1: ColorScheme = {
    name: "Baseline",
    type: "speedpaint-led",
    base: getBase(),
    midtone1: getMid1(),
    midtone2: getMid2(),
    highlight: getHigh(),
  };

  const themeShift = theme === "grimdark" ? 0 : theme === "vibrant" ? 6 : theme === "natural" ? 3 : 9;
  const s2: ColorScheme = {
    name: "Theme variation",
    type: "speedpaint-led",
    base: paints[(paints.indexOf(s1.base) + themeShift) % paints.length],
    midtone1: paints[(paints.indexOf(s1.midtone1) + themeShift + 2) % paints.length],
    midtone2: s1.midtone2 ? paints[(paints.indexOf(s1.midtone2) + themeShift + 4) % paints.length] : null,
    highlight: paints[(paints.indexOf(s1.highlight) + themeShift + 1) % paints.length],
  };

  const s3: ColorScheme = {
    name: "Override variation",
    type: "speedpaint-led",
    base: baseOverride ? (paints.find(p => p.name === baseOverride) || s2.base) : s2.base,
    midtone1: midtoneOverrides[0] ? (paints.find(p => p.name === midtoneOverrides[0]) || s2.midtone1) : s2.midtone1,
    midtone2: midtoneOverrides[1] ? (paints.find(p => p.name === midtoneOverrides[1]) || s2.midtone2) : s2.midtone2,
    highlight: highlightOverride ? (paints.find(p => p.name === highlightOverride) || s2.highlight) : s2.highlight,
  };

  return [s1, s2, s3];
}
function useMiniatureDetails() {
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  return {
    name, setName, origin, setOrigin,
    manufacturer, setManufacturer,
    role, setRole, customRole, setCustomRole,
  };
}

export default function Index() {
  const {
    state,
    setActiveStep,
    addMainImages,
    addReferenceImages,
    removeImage,
    setSelectedImageIndex,
    setPrimeColor,
    setZenithalEnabled,
    setZenithalScheme,
    setZenithalMethod,
    setZenithalDirection,
    setSelectedTheme,
    setBaseOverride,
    setMidtoneOverrides,
    setHighlightOverride,
    setManualTempInput,
    setSprayOverride,
    setExtractedColors,
    setColorSchemes,
    setAnatomyRegions,
    setInitialRepaintImage,
    setCustomRepaintImage,
    setActivePrompt,
    setGeminiHistory,
    setRepaintLog,
    setCurrentlyRepainting,
    setBackgroundRepainting,
    setRepaintStartTime,
    setPipelineComplete,
    setPipelineError,
    setSharedSliderIndex,
    setActiveSchemeIndex,
    setPrimingRepaintEntry,
    setColorRepaintEntry,
    setRepaintHistory,
    appendReferenceBase64s,
  } = usePrimetimeState();

  const themeInteracted = useRef(false);
  const overrideInteracted = useRef(false);
  const rehydratedRef = useRef(false);
  const savedImageIdsRef = useRef<Set<string>>(new Set());

  const miniature = useMiniatureDetails();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mainImages = state.mainImages;
  const refImages = state.referenceImages;
  const mainImage = mainImages[0] ?? null;
  const originalImage = mainImages[state.sharedSliderIndex]?.objectUrl ?? null;
  const allImages = [...mainImages, ...refImages];

  const getOverrideHex = (name: string | null) => {
    if (!name) return null;
    return SPEEDPAINT_MOST_WANTED.find((p) => p.name === name)?.hex || null;
  };

  // One-time rehydration on mount
  useEffect(() => {
    if (rehydratedRef.current) return;
    rehydratedRef.current = true;

    (async () => {
      try {
        await initDB();

        try {
          const raw = sessionStorage.getItem('primetime-session');
          if (raw) {
            const s = JSON.parse(raw);
            if (s.activeStep) setActiveStep(s.activeStep);
            if (s.primeColor) setPrimeColor(s.primeColor);
            if (typeof s.zenithalEnabled === 'boolean') setZenithalEnabled(s.zenithalEnabled);
            if (s.zenithalScheme) setZenithalScheme(s.zenithalScheme);
            if (s.zenithalMethod) setZenithalMethod(s.zenithalMethod);
            if (s.zenithalDirection) setZenithalDirection(s.zenithalDirection);
            if (s.selectedTheme) setSelectedTheme(s.selectedTheme);
            if (typeof s.activeSchemeIndex === 'number') setActiveSchemeIndex(s.activeSchemeIndex);
            if (s.baseOverride !== undefined) setBaseOverride(s.baseOverride);
            if (Array.isArray(s.midtoneOverrides)) setMidtoneOverrides(s.midtoneOverrides);
            if (s.highlightOverride !== undefined) setHighlightOverride(s.highlightOverride);
            if (typeof s.pipelineComplete === 'boolean') setPipelineComplete(s.pipelineComplete);
            if (typeof s.sharedSliderIndex === 'number') setSharedSliderIndex(s.sharedSliderIndex);
            themeInteracted.current = true;
            overrideInteracted.current = true;
          }
        } catch {
          // ignore corrupt session
        }

        const stored = await loadImages();
        const mainFiles = stored.filter((s) => s.type === 'main').map((s) => s.file);
        const refFiles = stored.filter((s) => s.type === 'reference').map((s) => s.file);
        if (mainFiles.length) addMainImages(mainFiles);
        if (refFiles.length) addReferenceImages(refFiles);

        const repaints = await loadRepaints();
        for (const { key, data } of repaints) {
          const m = key.match(/^(priming|color)-(\d+)$/);
          if (!m) continue;
          const idx = parseInt(m[2], 10);
          if (m[1] === 'priming') setPrimingRepaintEntry(idx, data);
          else setColorRepaintEntry(idx, data);
        }
      } catch (e) {
        console.error('[rehydrate] failed', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist any new images that haven't been saved yet
  useEffect(() => {
    const all = [
      ...state.mainImages.map((i) => ({ id: i.id, file: i.file, type: 'main' as const })),
      ...state.referenceImages.map((i) => ({ id: i.id, file: i.file, type: 'reference' as const })),
    ];
    for (const { id, file, type } of all) {
      if (!savedImageIdsRef.current.has(id)) {
        savedImageIdsRef.current.add(id);
        saveImage(id, file, type).catch((e) => console.error('[saveImage] failed', e));
      }
    }
  }, [state.mainImages, state.referenceImages]);

  const handleRemoveImage = useCallback(
    async (id: string) => {
      removeImage(id);
      savedImageIdsRef.current.delete(id);
      try {
        await clearImages();
        const remaining = [
          ...state.mainImages
            .filter((i) => i.id !== id)
            .map((i) => ({ id: i.id, file: i.file, type: 'main' as const })),
          ...state.referenceImages
            .filter((i) => i.id !== id)
            .map((i) => ({ id: i.id, file: i.file, type: 'reference' as const })),
        ];
        for (const { id: rid, file, type } of remaining) {
          await saveImage(rid, file, type);
          savedImageIdsRef.current.add(rid);
        }
      } catch (e) {
        console.error('[handleRemoveImage] failed', e);
      }
    },
    [removeImage, state.mainImages, state.referenceImages],
  );

  useEffect(() => {
    if (state.referenceImages.length === 0) {
      setExtractedColors([]);
      return;
    }
    Promise.all(
      state.referenceImages.map(img => extractDominantColors(img.objectUrl))
    ).then(results => {
      const merged = [...new Set(results.flat())];
      setExtractedColors(merged);
    });
  }, [state.referenceImages.length]);

  const assembledPrompt = useMemo(() => {
    const roleMap: Record<string, string> = {
      'Boss / Major Enemy': 'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
      'Hero / Champion': 'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
      'Villain / Antagonist': 'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
      'Monster / Creature': 'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
      'Daemon / Otherworldly Entity': 'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
      'Undead / Construct': 'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
      'Vehicle / War Machine': 'Hard surface priority. Panel shading, wear and weathering appropriate.',
      'Terrain / Structure': 'Hard surface priority. Panel shading, wear and weathering appropriate.',
      'Infantry / Foot Soldier': 'Tabletop standard. Efficient coverage, clear contrast, unit-consistent aesthetic.',
      'Swarm / Horde Unit': 'Tabletop standard. Efficient coverage, clear contrast, unit-consistent aesthetic.',
    };

    const primerNote = state.zenithalEnabled
      ? 'Zenithal gradient — light from above, shadow below. Preserve and build on it.'
      : state.primeColor === 'white'
        ? 'White primer. Push shadows hard into recesses.'
        : state.primeColor === 'black'
          ? 'Black primer. Drive highlights up on raised surfaces. Let recesses stay dark.'
          : 'Grey primer. Build shading from scratch, light from 45° above.';

    const activeScheme = state.colorSchemes?.[state.activeSchemeIndex];
    const schemeNote = activeScheme
      ? `Colour scheme: ${activeScheme.name}. ` +
        `Base: ${activeScheme.base.name}. ` +
        `Midtone: ${activeScheme.midtone1.name}${activeScheme.midtone2 ? `, ${activeScheme.midtone2.name}` : ''}. ` +
        `Highlight: ${activeScheme.highlight.name}.`
      : '';

    const themeNote = state.selectedTheme
      ? `Theme: ${state.selectedTheme}.`
      : '';

    const lines = [
      state.activePrompt ?? '',
      '',
      '--- Miniature context ---',
      miniature.name ? `Name: ${miniature.name}` : '',
      miniature.origin ? `Origin: ${miniature.origin}` : '',
      miniature.manufacturer ? `Manufacturer: ${miniature.manufacturer}` : '',
      miniature.role && miniature.role !== 'other'
        ? `Role: ${miniature.role}. ${roleMap[miniature.role] ?? ''}`
        : miniature.role === 'other' && miniature.customRole
          ? `Role: ${miniature.customRole}`
          : '',
      themeNote,
      schemeNote,
      `Primer: ${primerNote}`,
    ].filter(Boolean);

    return lines.join('\n').trim();
  }, [
    state.activePrompt,
    state.primeColor,
    state.zenithalEnabled,
    state.selectedTheme,
    state.colorSchemes,
    state.activeSchemeIndex,
    state.baseOverride,
    state.midtoneOverrides,
    state.highlightOverride,
    miniature.name,
    miniature.origin,
    miniature.manufacturer,
    miniature.role,
    miniature.customRole,
  ]);

  useEffect(() => {
    const schemes = generateSchemes(
      state.extractedColors,
      state.selectedTheme,
      state.baseOverride,
      state.midtoneOverrides,
      state.highlightOverride,
    );
    setColorSchemes(schemes);
  }, [state.extractedColors, state.selectedTheme, state.baseOverride, state.midtoneOverrides, state.highlightOverride]);

  const activeScheme = state.colorSchemes?.[state.activeSchemeIndex];
  const previewBase = activeScheme?.base.hex || null;
  const previewMid1 = activeScheme?.midtone1.hex || null;
  const previewMid2 = activeScheme?.midtone2?.hex || null;
  const previewHigh = activeScheme?.highlight.hex || null;

  useEffect(() => {
    if (!overrideInteracted.current) {
      overrideInteracted.current = true;
      return;
    }
    if (state.baseOverride || state.midtoneOverrides.length > 0 || state.highlightOverride) {
      setActiveSchemeIndex(2);
    }
  }, [state.baseOverride, state.midtoneOverrides, state.highlightOverride]);

  const recolorMap = useRecolorMap(mainImages, {
    baseColor: previewBase,
    midtone1Color: previewMid1,
    midtone2Color: previewMid2,
    highlightColor: previewHigh,
    zenithalEnabled: state.zenithalEnabled,
    zenithalDirection: state.zenithalDirection,
  });

  const [primingResultMap, setPrimingResultMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (mainImages.length === 0) {
      setPrimingResultMap({});
      return;
    }

    const urls: string[] = [];
    let cancelled = false;

    const processAll = async () => {
      const newMap: Record<string, string | null> = {};
      for (const img of mainImages) {
        if (cancelled) return;
        const el = new Image();
        el.crossOrigin = "anonymous";
        el.src = img.objectUrl;
        await new Promise<void>((r) => {
          el.onload = () => r();
          el.onerror = () => r();
        });
        if (cancelled) return;

        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const result = processZenithalPreview(el, {
          zenithalEnabled: state.zenithalEnabled,
          zenithalMethod: state.zenithalScheme,
          zenithalDirection: state.zenithalDirection,
          primeColour: state.primeColor,
        });

        const blob = await new Promise<Blob | null>((r) => result.toBlob(r, "image/png"));
        if (cancelled || !blob) return;

        const url = URL.createObjectURL(blob);
        urls.push(url);
        newMap[img.id] = url;
      }
      if (!cancelled) setPrimingResultMap(newMap);
    };

    processAll();

    return () => {
      cancelled = true;
      urls.forEach(URL.revokeObjectURL);
    };
  }, [mainImages.length, state.primeColor, state.zenithalEnabled, state.zenithalScheme, state.zenithalDirection]);

  const handleThemeSelect = useCallback(
    (t: ThemeId) => {
      themeInteracted.current = true;
      setSelectedTheme(t);
      setActiveSchemeIndex(1);
      if (state.activeStep !== "color-plan") setActiveStep("color-plan");
    },
    [state.activeStep],
  );

  // Background priming regeneration on settings change
  const primingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primingCacheRef = useRef<Map<string, string>>(new Map());
  const colorCacheRef = useRef<Map<string, string>>(new Map());
  const colorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sliderIndexRef = useRef(state.sharedSliderIndex);

  useEffect(() => {
    sliderIndexRef.current = state.sharedSliderIndex;
  }, [state.sharedSliderIndex]);

  useEffect(() => {
    if (!state.pipelineComplete || mainImages.length === 0) return;
    if (primingDebounceRef.current) clearTimeout(primingDebounceRef.current);

    primingDebounceRef.current = setTimeout(async () => {
      const idx = sliderIndexRef.current;
      const img = mainImages[idx];
      if (!img) return;

      const cacheKey = `${img.id}|${state.primeColor}|${state.zenithalEnabled}|${state.zenithalScheme}|${state.zenithalMethod}|${state.zenithalDirection}`;
      if (primingCacheRef.current.has(cacheKey)) {
        setPrimingRepaintEntry(idx, primingCacheRef.current.get(cacheKey)!);
        saveRepaint(`priming-${idx}`, primingCacheRef.current.get(cacheKey)!).catch(() => {});
        return;
      }

      setBackgroundRepainting(true);
      setRepaintStartTime(new Date());
      toast("Updating priming preview…", { duration: 2000 });
      const startTime = Date.now();

      try {
        const base64 = await toBase64(img.file);
        const refBase64s = await Promise.all(state.referenceImages.map((i) => toBase64(i.file)));
        const { image: primingImage } = await generatePrimingRepaint(
          base64,
          "miniature figure",
          state.primeColor,
          state.zenithalEnabled,
          state.zenithalScheme,
          state.zenithalMethod,
          state.zenithalDirection,
          refBase64s,
        );
        primingCacheRef.current.set(cacheKey, primingImage);
        setPrimingRepaintEntry(idx, primingImage);
        saveRepaint(`priming-${idx}`, primingImage).catch(() => {});

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        setRepaintLog((prev) => [
          ...prev,
          { section: "priming", timestamp: new Date(), elapsedSeconds: elapsed },
        ]);
        toast.success("Priming preview updated.", { duration: 3000 });
        setBackgroundRepainting(false);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Priming update failed.";
        toast.error(message, { duration: 4000 });
        setBackgroundRepainting(false);
      }
    }, 5000);

    return () => {
      if (primingDebounceRef.current) clearTimeout(primingDebounceRef.current);
    };
  }, [
    state.primeColor,
    state.zenithalEnabled,
    state.zenithalScheme,
    state.zenithalMethod,
    state.zenithalDirection,
    state.sharedSliderIndex,
  ]);

  useEffect(() => {
    if (!state.pipelineComplete || mainImages.length === 0) return;
    const idx = state.sharedSliderIndex;
    const img = mainImages[idx];
    if (!img) return;
    const primingImage = state.primingRepaintMap[idx];
    if (!primingImage) return;
    if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);

    colorDebounceRef.current = setTimeout(async () => {
      const colorCacheKey = `${img.id}|${state.primeColor}|${state.zenithalEnabled}|${state.zenithalScheme}|${state.zenithalMethod}|${state.zenithalDirection}|${state.activeSchemeIndex}|${state.selectedTheme}|${JSON.stringify(state.baseOverride)}|${JSON.stringify(state.midtoneOverrides)}|${JSON.stringify(state.highlightOverride)}`;
      if (colorCacheRef.current.has(colorCacheKey)) {
        setColorRepaintEntry(idx, colorCacheRef.current.get(colorCacheKey)!);
        saveRepaint(`color-${idx}`, colorCacheRef.current.get(colorCacheKey)!).catch(() => {});
        return;
      }

      try {
        const { data: compressedData, mimeType } = await compressBase64Image(primingImage);
        const compressedDataUri = `data:${mimeType};base64,${compressedData}`;
        const refBase64s = await Promise.all(state.referenceImages.map((i) => toBase64(i.file)));
        const { image } = await generateRepaint(
          compressedDataUri,
          state.anatomyRegions,
          "miniature figure",
          state.primeColor,
          refBase64s,
        );
        colorCacheRef.current.set(colorCacheKey, image);
        setColorRepaintEntry(idx, image);
        saveRepaint(`color-${idx}`, image).catch(() => {});
      } catch {
        // silent — colour repaint is best-effort
      }
    }, 6000);

    return () => {
      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    };
  }, [state.primingRepaintMap, state.sharedSliderIndex]);

  const handleAnalyseAndRepaint = useCallback(async () => {
    if (mainImages.length === 0 || state.currentlyRepainting) return;
    setPipelineError(null);
    setCurrentlyRepainting(true);
    setRepaintStartTime(new Date());
    const startTime = Date.now();

    try {
      const refBase64s = await Promise.all(state.referenceImages.map((img) => toBase64(img.file)));

      for (let i = 0; i < mainImages.length; i++) {
        setSharedSliderIndex(i);
        const base64 = await toBase64(mainImages[i].file);
        const regions = await analyseAnatomy(base64, refBase64s);

        const { image: primingImage } = await generatePrimingRepaint(
          base64,
          "miniature figure",
          state.primeColor,
          state.zenithalEnabled,
          state.zenithalScheme,
          state.zenithalMethod,
          state.zenithalDirection,
          refBase64s,
        );
        setPrimingRepaintEntry(i, primingImage);
        saveRepaint(`priming-${i}`, primingImage).catch(() => {});
        const primingCacheKey = `${mainImages[i].id}|${state.primeColor}|${state.zenithalEnabled}|${state.zenithalScheme}|${state.zenithalMethod}|${state.zenithalDirection}`;
        primingCacheRef.current.set(primingCacheKey, primingImage);

        const { image, prompt } = await generateRepaint(base64, regions, "miniature figure", state.primeColor, refBase64s);
        setColorRepaintEntry(i, image);
        saveRepaint(`color-${i}`, image).catch(() => {});
        const colorCacheKey = `${mainImages[i].id}|${state.primeColor}|${state.zenithalEnabled}|${state.zenithalScheme}|${state.zenithalMethod}|${state.zenithalDirection}|${state.activeSchemeIndex}|${state.selectedTheme}|${JSON.stringify(state.baseOverride)}|${JSON.stringify(state.midtoneOverrides)}|${JSON.stringify(state.highlightOverride)}`;
        colorCacheRef.current.set(colorCacheKey, image);

        if (i === 0) {
          setAnatomyRegions(regions);
          setInitialRepaintImage(image);
          setCustomRepaintImage(image);
          setActivePrompt(prompt);
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          setGeminiHistory([
            { role: "user", textContent: "Anatomy analysis", hasImage: true },
            { role: "model", textContent: JSON.stringify(regions), hasImage: false },
            { role: "user", textContent: prompt, hasImage: true },
            { role: "model", imageContent: image, hasImage: true },
          ]);
          setRepaintLog((prev) => [
            ...prev,
            {
              section: "initial",
              timestamp: new Date(),
              elapsedSeconds: elapsed,
            },
          ]);
          setRepaintHistory((prev) => [...prev, { label: "Initial repaint", image }]);
        }
      }

      setSharedSliderIndex(0);
      setPipelineComplete(true);
      setActiveStep('priming');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Pipeline failed.";
      setPipelineError(message);
    } finally {
      setCurrentlyRepainting(false);
    }
  }, [mainImages, state.currentlyRepainting, state.referenceImages]);

  const handleSubmitRepaint = useCallback(async () => {
    if (!assembledPrompt || !mainImage || state.currentlyRepainting) return;
    setSubmitError(null);
    setCurrentlyRepainting(true);
    setRepaintStartTime(new Date());
    const startTime = Date.now();

    try {
      const base64 = await toBase64(mainImage.file);
      const refBase64s = await Promise.all(state.referenceImages.map((img) => toBase64(img.file)));
      const result = await submitCustomRepaint(base64, assembledPrompt, refBase64s);
      setCustomRepaintImage(result);
      setColorRepaintEntry(state.sharedSliderIndex, result);
      saveRepaint(`color-${state.sharedSliderIndex}`, result).catch(() => {});

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const imageTurns = state.geminiHistory.filter((t) => t.hasImage);
      const trimmed =
        imageTurns.length >= 5
          ? state.geminiHistory.filter((t) => !t.hasImage || t !== state.geminiHistory.filter((x) => x.hasImage)[0])
          : state.geminiHistory;

      setGeminiHistory([
        ...trimmed,
        { role: "user", textContent: assembledPrompt, hasImage: false },
        { role: "model", imageContent: result, hasImage: true },
      ]);
      setRepaintLog((prev) => [
        ...prev,
        {
          section: "colorPlan",
          timestamp: new Date(),
          elapsedSeconds: elapsed,
        },
      ]);
      setRepaintHistory((prev) => [...prev, { label: "Custom repaint", image: result }]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Repaint failed.";
      setSubmitError(message);
    } finally {
      setCurrentlyRepainting(false);
    }
  }, [mainImage, state.currentlyRepainting, assembledPrompt]);

  const handlePromptChange = useCallback((prompt: string) => {
    setActivePrompt(prompt);
  }, []);

  const renderWorkspace = () => {
    switch (state.activeStep) {
      case "upload":
        return (
          <ImageUploader
            mainImages={state.mainImages}
            referenceImages={state.referenceImages}
            onMainImagesChange={(files) => addMainImages(files)}
            onReferenceImagesChange={async (files) => {
              addReferenceImages(files);
              const base64s = await Promise.all(
                files.map((f) => toBase64(f instanceof File ? f : (f as unknown as { file: File }).file)),
              );
              appendReferenceBase64s(base64s);
              console.log("[upload] referenceBase64s stored:", base64s.length);
            }}
            repaintStartTime={state.repaintStartTime}
            onAnalyseAndRepaint={handleAnalyseAndRepaint}
            pipelineComplete={state.pipelineComplete}
            pipelineError={state.pipelineError}
            currentlyRepainting={state.currentlyRepainting}
          />
        );
      case "priming":
        return (
          <PrimingZenithalPanel
            primeColor={state.primeColor}
            zenithalEnabled={state.zenithalEnabled}
            zenithalScheme={state.zenithalScheme}
            zenithalMethod={state.zenithalMethod}
            zenithalDirection={state.zenithalDirection}
            currentTemp={state.currentTemp}
            manualTempInput={state.manualTempInput}
            images={mainImages}
            primingResultMap={primingResultMap}
            onPrimeColorChange={setPrimeColor}
            onZenithalEnabledChange={setZenithalEnabled}
            onZenithalSchemeChange={setZenithalScheme}
            onZenithalMethodChange={setZenithalMethod}
            onZenithalDirectionChange={setZenithalDirection}
            onManualTempChange={setManualTempInput}
            assembledPrompt={assembledPrompt}
            miniature={miniature}
            onSubmitRepaint={handleSubmitRepaint}
            currentlyRepainting={state.currentlyRepainting}
            submitError={submitError}
            pipelineComplete={state.pipelineComplete}
            sharedSliderIndex={state.sharedSliderIndex}
            onSliderIndexChange={setSharedSliderIndex}
            primingRepaintMap={state.primingRepaintMap}
          />
        );
      case "color-plan":
        return (
          <ColorPlanPanel
            extractedColors={state.extractedColors}
            selectedTheme={state.selectedTheme}
            colorSchemes={state.colorSchemes}
            activeSchemeIndex={state.activeSchemeIndex}
            onSchemeSelect={setActiveSchemeIndex}
            baseOverride={state.baseOverride}
            midtoneOverrides={state.midtoneOverrides}
            highlightOverride={state.highlightOverride}
            onThemeSelect={handleThemeSelect}
            onBaseChange={setBaseOverride}
            onMidtoneChange={setMidtoneOverrides}
            onHighlightChange={setHighlightOverride}
            images={mainImages}
            recolorMap={recolorMap}
            assembledPrompt={assembledPrompt}
            miniature={miniature}
            onSubmitRepaint={handleSubmitRepaint}
            currentlyRepainting={state.currentlyRepainting}
            submitError={submitError}
            pipelineComplete={state.pipelineComplete}
            zenithalEnabled={state.zenithalEnabled}
            primeColor={state.primeColor}
            sharedSliderIndex={state.sharedSliderIndex}
            onSliderIndexChange={setSharedSliderIndex}
            primingRepaintMap={state.primingRepaintMap}
            colorRepaintMap={state.colorRepaintMap}
            onPrimeColorChange={setPrimeColor}
          />
        );
      case "brush-guide":
        return <BrushGuidePanel />;
      case "paint-handling":
        return <PaintHandlingPanel />;
      case "thinning-plan":
        return <PaintPlanPanel />;
      case "finish":
        return <FinishVarnishPanel />;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundImage: "linear-gradient(65deg, #13131a 0%, #1e1b2e 100%)" }}
    >
      <ControlRail
        activeStep={state.activeStep}
        onStepChange={setActiveStep}
        hasImages={mainImages.length > 0}
        pipelineComplete={state.pipelineComplete}
        currentlyRepainting={state.currentlyRepainting}
        backgroundRepainting={state.backgroundRepainting}
        repaintStartTime={state.repaintStartTime}
        repaintLog={state.repaintLog}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">{renderWorkspace()}</div>
        </div>

        <BottomBar
          images={allImages}
          selectedIndex={state.selectedImageIndex}
          onSelect={setSelectedImageIndex}
          onRemove={handleRemoveImage}
          selectedTheme={state.selectedTheme}
          repaintHistory={state.repaintHistory}
        />
      </div>
    </div>
  );
}
