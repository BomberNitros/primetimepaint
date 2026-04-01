import { useEffect, useRef, useCallback } from 'react';
import { usePrimetimeState } from '@/hooks/usePrimetimeState';
import { ControlRail } from '@/components/ControlRail';
import { BottomBar } from '@/components/BottomBar';
import { ImageUploader } from '@/components/ImageUploader';
import { RecolorPreview } from '@/components/RecolorPreview';
import { DownloadBar } from '@/components/DownloadBar';
import { SurfacePrepPanel } from '@/components/panels/SurfacePrepPanel';
import { PrimingZenithalPanel } from '@/components/panels/PrimingZenithalPanel';
import { ColorPlanPanel } from '@/components/panels/ColorPlanPanel';
import { BrushGuidePanel } from '@/components/panels/BrushGuidePanel';
import { PaintHandlingPanel } from '@/components/panels/PaintHandlingPanel';
import { PaintPlanPanel } from '@/components/panels/PaintPlanPanel';
import { FinishVarnishPanel } from '@/components/panels/FinishVarnishPanel';
import { extractDominantColors } from '@/lib/color-extraction';
import { SPEEDPAINT_MOST_WANTED } from '@/data/speedpaints';
import { ColorScheme, ThemeId } from '@/types/primetime';

// Generate 3 colour schemes from extracted colours + theme + overrides
function generateSchemes(
  extractedColors: string[],
  theme: ThemeId | null,
  baseOverride: string | null,
  midtoneOverrides: string[],
  highlightOverride: string | null,
): ColorScheme[] {
  const paints = SPEEDPAINT_MOST_WANTED;

  // Find closest Speedpaint to a hex colour
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

  // Scheme 1: closest match (Speedpaint-led)
  const s1: ColorScheme = {
    name: 'Closest Match',
    type: 'speedpaint-led',
    base: getBase(),
    midtone1: getMid1(),
    midtone2: getMid2(),
    highlight: getHigh(),
  };

  // Scheme 2: theme-shifted (Speedpaint-led)
  const themeShift = theme === 'grimdark' ? 0 : theme === 'vibrant' ? 6 : theme === 'natural' ? 3 : 9;
  const s2Base = baseOverride ? s1.base : paints[(paints.indexOf(s1.base) + themeShift) % paints.length];
  const s2: ColorScheme = {
    name: 'Theme Variation',
    type: 'speedpaint-led',
    base: s2Base,
    midtone1: paints[(paints.indexOf(s1.midtone1) + themeShift + 2) % paints.length],
    midtone2: s1.midtone2 ? paints[(paints.indexOf(s1.midtone2) + themeShift + 4) % paints.length] : null,
    highlight: highlightOverride ? s1.highlight : paints[(paints.indexOf(s1.highlight) + themeShift + 1) % paints.length],
  };

  // Scheme 3: mix-based
  const s3: ColorScheme = {
    name: 'Mix Approach',
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
    addImages,
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
  } = usePrimetimeState();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainImages = state.uploadedImages.filter(i => i.type === 'main');
  const selectedImage = mainImages[state.selectedImageIndex] || null;

  // Get active override colours for preview
  const getOverrideHex = (name: string | null) => {
    if (!name) return null;
    return SPEEDPAINT_MOST_WANTED.find(p => p.name === name)?.hex || null;
  };

  // Extract colours when images change
  useEffect(() => {
    if (mainImages.length === 0) { setExtractedColors([]); return; }
    const img = mainImages[0];
    extractDominantColors(img.objectUrl).then(colors => {
      setExtractedColors(colors);
    });
  }, [mainImages.length]);

  // Regenerate schemes when dependencies change
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

  // Resolve active colours for preview
  const activeScheme = state.colorSchemes[0];
  const previewBase = getOverrideHex(state.baseOverride) || activeScheme?.base.hex || null;
  const previewMid1 = getOverrideHex(state.midtoneOverrides[0]) || activeScheme?.midtone1.hex || null;
  const previewMid2 = getOverrideHex(state.midtoneOverrides[1]) || activeScheme?.midtone2?.hex || null;
  const previewHigh = getOverrideHex(state.highlightOverride) || activeScheme?.highlight.hex || null;

  const handleThemeSelect = useCallback((t: ThemeId) => {
    setSelectedTheme(t);
    if (state.activeStep !== 'color-plan') setActiveStep('color-plan');
  }, [state.activeStep]);

  const renderWorkspace = () => {
    switch (state.activeStep) {
      case 'upload':
        return (
          <ImageUploader
            onUpload={addImages}
            mainCount={mainImages.length}
          />
        );
      case 'surface-prep':
        return (
          <SurfacePrepPanel
            currentTemp={state.currentTemp}
            manualTempInput={state.manualTempInput}
            sprayOverride={state.sprayOverride}
            geoFailed={state.geoFailed}
            onManualTempChange={setManualTempInput}
            onSprayOverrideChange={setSprayOverride}
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
            onPrimeColorChange={setPrimeColor}
            onZenithalEnabledChange={setZenithalEnabled}
            onZenithalSchemeChange={setZenithalScheme}
            onZenithalMethodChange={setZenithalMethod}
            onZenithalDirectionChange={setZenithalDirection}
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
          />
        );
      case 'brush-guide':
        return <BrushGuidePanel />;
      case 'paint-handling':
        return <PaintHandlingPanel />;
      case 'paint-plan':
        return <PaintPlanPanel />;
      case 'finish':
        return <FinishVarnishPanel />;
    }
  };

  // Show preview in color-plan and priming steps
  const showPreview = ['color-plan', 'priming'].includes(state.activeStep) && selectedImage;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ControlRail
        activeStep={state.activeStep}
        onStepChange={setActiveStep}
        hasImages={mainImages.length > 0}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace */}
        <div className="flex-1 overflow-y-auto">
          <div className={showPreview ? 'flex gap-6 p-6' : 'p-6'}>
            {/* Panel content */}
            <div className={showPreview ? 'flex-1 min-w-0' : ''}>
              {renderWorkspace()}
            </div>

            {/* Preview sidebar */}
            {showPreview && (
              <div className="w-[360px] flex-shrink-0 space-y-3">
                <RecolorPreview
                  ref={previewCanvasRef}
                  imageUrl={selectedImage.objectUrl}
                  baseColor={previewBase}
                  midtone1Color={previewMid1}
                  midtone2Color={previewMid2}
                  highlightColor={previewHigh}
                  zenithalEnabled={state.zenithalEnabled}
                  zenithalDirection={state.zenithalDirection}
                />
                <DownloadBar previewCanvasRef={previewCanvasRef} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <BottomBar
          images={state.uploadedImages}
          selectedIndex={state.selectedImageIndex}
          onSelect={setSelectedImageIndex}
          onRemove={removeImage}
          selectedTheme={state.selectedTheme}
        />
      </div>
    </div>
  );
}
