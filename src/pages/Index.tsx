import { useEffect, useState, useCallback } from 'react';
import { usePrimetimeState } from '@/hooks/usePrimetimeState';
import { useRecolorMap } from '@/hooks/useRecolorMap';
import { ControlRail } from '@/components/ControlRail';
import { BottomBar } from '@/components/BottomBar';
import { ImageUploader } from '@/components/ImageUploader';
import { PrimingZenithalPanel } from '@/components/panels/PrimingZenithalPanel';
import { ColorPlanPanel } from '@/components/panels/ColorPlanPanel';
import { BrushGuidePanel } from '@/components/panels/BrushGuidePanel';
import { PaintHandlingPanel } from '@/components/panels/PaintHandlingPanel';
import { PaintPlanPanel } from '@/components/panels/PaintPlanPanel';
import { FinishVarnishPanel } from '@/components/panels/FinishVarnishPanel';
import { extractDominantColors } from '@/lib/color-extraction';
import { processZenithalPreview } from '@/lib/zenithal-preview';
import { SPEEDPAINT_MOST_WANTED } from '@/data/speedpaints';
import { ColorScheme, ThemeId } from '@/types/primetime';
import {
  toBase64,
  analyseAnatomy,
  generateRepaint,
  submitCustomRepaint,
} from '@/lib/gemini-pipeline';

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
      const [pr, pg, pb] = [parseInt(p.hex.slice(1, 3), 16), parseInt(p.hex.slice(3, 5), 16), parseInt(p.hex.slice(5, 7), 16)];
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < bestDist) { best = p; bestDist = dist; }
    }
    return best;
  }

  const getBase = () => baseOverride ? paints.find(p => p.name === baseOverride) || paints[8] : (extractedColors[0] ? closestPaint(extractedColors[0]) : paints[8]);
  const getMid1 = () => midtoneOverrides[0] ? paints.find(p => p.name === midtoneOverrides[0]) || paints[7] : (extractedColors[1] ? closestPaint(extractedColors[1]) : paints[7]);
  const getMid2 = () => midtoneOverrides[1] ? paints.find(p => p.name === midtoneOverrides[1]) || null : (extractedColors[2] ? closestPaint(extractedColors[2]) : null);
  const getHigh = () => highlightOverride ? paints.find(p => p.name === highlightOverride) || paints[23] : (extractedColors[3] ? closestPaint(extractedColors[3]) : paints[23]);

  const s1: ColorScheme = {
    name: 'Closest match',
    type: 'speedpaint-led',
    base: getBase(),
    midtone1: getMid1(),
    midtone2: getMid2(),
    highlight: getHigh(),
  };

  const themeShift = theme === 'grimdark' ? 0 : theme === 'vibrant' ? 6 : theme === 'natural' ? 3 : 9;
  const s2Base = baseOverride ? s1.base : paints[(paints.indexOf(s1.base) + themeShift) % paints.length];
  const s2: ColorScheme = {
    name: 'Theme variation',
    type: 'speedpaint-led',
    base: s2Base,
    midtone1: paints[(paints.indexOf(s1.midtone1) + themeShift + 2) % paints.length],
    midtone2: s1.midtone2 ? paints[(paints.indexOf(s1.midtone2) + themeShift + 4) % paints.length] : null,
    highlight: highlightOverride ? s1.highlight : paints[(paints.indexOf(s1.highlight) + themeShift + 1) % paints.length],
  };

  const s3: ColorScheme = {
    name: 'Mix approach',
    type: 'mix-based',
    base: s1.base,
    midtone1: paints[(paints.indexOf(s1.midtone1) + 12) % paints.length],
    midtone2: s1.midtone2 ? paints[(paints.indexOf(s1.midtone2) + 8) % paints.length] : null,
    highlight: s1.highlight,
  };

  return [s1, s2, s3];
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
    setRepaintStartTime,
    setPipelineComplete,
    setPipelineError,
    setSharedSliderIndex,
    setRepaintMapEntry,
    setRepaintHistory,
  } = usePrimetimeState();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const mainImages = state.mainImages;
  const refImages = state.referenceImages;
  const mainImage = mainImages[0] ?? null;
  const originalImage = mainImages[state.sharedSliderIndex]?.objectUrl ?? null;
  const allImages = [...mainImages, ...refImages];

  const getOverrideHex = (name: string | null) => {
    if (!name) return null;
    return SPEEDPAINT_MOST_WANTED.find(p => p.name === name)?.hex || null;
  };

  useEffect(() => {
    if (mainImages.length === 0) { setExtractedColors([]); return; }
    const img = mainImages[0];
    extractDominantColors(img.objectUrl).then(colors => {
      setExtractedColors(colors);
    });
  }, [mainImages.length]);

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

  const activeScheme = state.colorSchemes[0];
  const previewBase = getOverrideHex(state.baseOverride) || activeScheme?.base.hex || null;
  const previewMid1 = getOverrideHex(state.midtoneOverrides[0]) || activeScheme?.midtone1.hex || null;
  const previewMid2 = getOverrideHex(state.midtoneOverrides[1]) || activeScheme?.midtone2?.hex || null;
  const previewHigh = getOverrideHex(state.highlightOverride) || activeScheme?.highlight.hex || null;

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
        el.crossOrigin = 'anonymous';
        el.src = img.objectUrl;
        await new Promise<void>(r => { el.onload = () => r(); el.onerror = () => r(); });
        if (cancelled) return;

        await new Promise<void>(r => requestAnimationFrame(() => r()));

        const result = processZenithalPreview(el, {
          zenithalEnabled: state.zenithalEnabled,
          zenithalMethod: state.zenithalScheme,
          zenithalDirection: state.zenithalDirection,
          primeColour: state.primeColor,
        });

        const blob = await new Promise<Blob | null>(r => result.toBlob(r, 'image/png'));
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

  const handleThemeSelect = useCallback((t: ThemeId) => {
    setSelectedTheme(t);
    if (state.activeStep !== 'color-plan') setActiveStep('color-plan');
  }, [state.activeStep]);

  // Pipeline: Analyse & Repaint
  const handleAnalyseAndRepaint = useCallback(async () => {
    if (!mainImage || state.currentlyRepainting) return;
    setPipelineError(null);
    setCurrentlyRepainting(true);
    setRepaintStartTime(new Date());
    const startTime = Date.now();

    try {
      const base64 = await toBase64(mainImage.file);
      const regions = await analyseAnatomy(base64, state.referenceBase64s);
      setAnatomyRegions(regions);

      const { image, prompt } = await generateRepaint(base64, regions, 'miniature figure', state.referenceBase64s);
      setInitialRepaintImage(image);
      setCustomRepaintImage(image);
      setRepaintMapEntry(state.sharedSliderIndex, image);
      setActivePrompt(prompt);

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      setGeminiHistory([
        { role: 'user', textContent: 'Anatomy analysis', hasImage: true },
        { role: 'model', textContent: JSON.stringify(regions), hasImage: false },
        { role: 'user', textContent: prompt, hasImage: true },
        { role: 'model', imageContent: image, hasImage: true },
      ]);
      setRepaintLog(prev => [...prev, {
        section: 'initial',
        timestamp: new Date(),
        elapsedSeconds: elapsed,
      }]);
      setRepaintHistory(prev => [...prev, { label: 'Initial repaint', image }]);
      setPipelineComplete(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Pipeline failed.';
      setPipelineError(message);
    } finally {
      setCurrentlyRepainting(false);
    }
  }, [mainImage, state.currentlyRepainting]);

  // Submit custom repaint from PaintDirectivePanel
  const handleSubmitRepaint = useCallback(async () => {
    if (!mainImage || state.currentlyRepainting || !state.activePrompt) return;
    setSubmitError(null);
    setCurrentlyRepainting(true);
    setRepaintStartTime(new Date());
    const startTime = Date.now();

    try {
      const base64 = await toBase64(mainImage.file);
      const result = await submitCustomRepaint(base64, state.activePrompt, state.referenceBase64s);
      setCustomRepaintImage(result);
      setRepaintMapEntry(state.sharedSliderIndex, result);

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const imageTurns = state.geminiHistory.filter(t => t.hasImage);
      const trimmed = imageTurns.length >= 5
        ? state.geminiHistory.filter(t =>
            !t.hasImage || t !== state.geminiHistory.filter(x => x.hasImage)[0])
        : state.geminiHistory;

      setGeminiHistory([
        ...trimmed,
        { role: 'user', textContent: state.activePrompt, hasImage: false },
        { role: 'model', imageContent: result, hasImage: true },
      ]);
      setRepaintLog(prev => [...prev, {
        section: 'colorPlan',
        timestamp: new Date(),
        elapsedSeconds: elapsed,
      }]);
      setRepaintHistory(prev => [...prev, { label: 'Custom repaint', image: result }]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Repaint failed.';
      setSubmitError(message);
    } finally {
      setCurrentlyRepainting(false);
    }
  }, [mainImage, state.currentlyRepainting, state.activePrompt]);

  const handlePromptChange = useCallback((prompt: string) => {
    setActivePrompt(prompt);
  }, []);

  const renderWorkspace = () => {
    switch (state.activeStep) {
      case 'upload':
        return (
          <ImageUploader
            mainImages={state.mainImages}
            referenceImages={state.referenceImages}
            onMainImagesChange={files => addMainImages(files)}
            onReferenceImagesChange={files => addReferenceImages(files)}
            repaintStartTime={state.repaintStartTime}
            onAnalyseAndRepaint={handleAnalyseAndRepaint}
            pipelineComplete={state.pipelineComplete}
            pipelineError={state.pipelineError}
            currentlyRepainting={state.currentlyRepainting}
          />
        );
      case 'priming':
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
            activePrompt={state.activePrompt}
            onPromptChange={handlePromptChange}
            onSubmitRepaint={handleSubmitRepaint}
            currentlyRepainting={state.currentlyRepainting}
            submitError={submitError}
            pipelineComplete={state.pipelineComplete}
            originalImage={originalImage}
            customRepaintImage={state.customRepaintImage}
            sliderIndex={state.sharedSliderIndex}
            onSliderIndexChange={setSharedSliderIndex}
          />
        );
      case 'color-plan':

        return (
          <ColorPlanPanel
            extractedColors={state.extractedColors}
            selectedTheme={state.selectedTheme}
            colorSchemes={state.colorSchemes}
            baseOverride={state.baseOverride}
            midtoneOverrides={state.midtoneOverrides}
            highlightOverride={state.highlightOverride}
            onThemeSelect={handleThemeSelect}
            onBaseChange={setBaseOverride}
            onMidtoneChange={setMidtoneOverrides}
            onHighlightChange={setHighlightOverride}
            images={mainImages}
            recolorMap={recolorMap}
            activePrompt={state.activePrompt}
            onPromptChange={handlePromptChange}
            onSubmitRepaint={handleSubmitRepaint}
            currentlyRepainting={state.currentlyRepainting}
            submitError={submitError}
            pipelineComplete={state.pipelineComplete}
            originalImage={originalImage}
            customRepaintImage={state.customRepaintImage}
            sliderIndex={state.sharedSliderIndex}
            onSliderIndexChange={setSharedSliderIndex}
            zenithalEnabled={state.zenithalEnabled}
            primeColor={state.primeColor}
          />
        );
      case 'brush-guide':
        return <BrushGuidePanel />;
      case 'paint-handling':
        return <PaintHandlingPanel />;
      case 'thinning-plan':
        return <PaintPlanPanel />;
      case 'finish':
        return <FinishVarnishPanel />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundImage: 'linear-gradient(65deg, #13131a 0%, #1e1b2e 100%)' }}>
      <ControlRail
        activeStep={state.activeStep}
        onStepChange={setActiveStep}
        hasImages={mainImages.length > 0}
        pipelineComplete={state.pipelineComplete}
        currentlyRepainting={state.currentlyRepainting}
        repaintStartTime={state.repaintStartTime}
        repaintLog={state.repaintLog}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderWorkspace()}
          </div>
        </div>

        <BottomBar
          images={allImages}
          selectedIndex={state.selectedImageIndex}
          onSelect={setSelectedImageIndex}
          onRemove={removeImage}
          selectedTheme={state.selectedTheme}
        />
      </div>
    </div>
  );
}
