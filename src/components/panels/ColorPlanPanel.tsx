import { useMemo } from 'react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ColorRoleSelector } from '@/components/ColorRoleSelector';
import { ColorTheoryHelper } from '@/components/ColorTheoryHelper';
import { SchemeCard } from '@/components/SchemeCard';
import { ImageSlider, SliderImage } from '@/components/ImageSlider';
import { DualSlider } from '@/components/DualSlider';
import { PaintDirectivePanel } from '@/components/PaintDirectivePanel';
import { ThemeId, ColorScheme, UploadedImage, PrimeColor } from '@/types/primetime';
import { cn } from '@/lib/utils';
import { Layers, SlidersHorizontal } from 'lucide-react';
import { randomFont } from '@/components/ControlRail';
import { SPEEDPAINT_MOST_WANTED } from '@/data/speedpaints';

interface ColorPlanPanelProps {
  extractedColors: string[];
  selectedTheme: ThemeId | null;
  colorSchemes: ColorScheme[];
  baseOverride: string | null;
  midtoneOverrides: string[];
  highlightOverride: string | null;
  onThemeSelect: (t: ThemeId) => void;
  onBaseChange: (v: string | null) => void;
  onMidtoneChange: (v: string[]) => void;
  onHighlightChange: (v: string | null) => void;
  images: UploadedImage[];
  recolorMap: Record<string, string | null>;
  activePrompt: string | null;
  onPromptChange: (prompt: string) => void;
  onSubmitRepaint: () => void;
  currentlyRepainting: boolean;
  submitError: string | null;
  pipelineComplete: boolean;
  zenithalEnabled: boolean;
  primeColor: string;
  onPrimeColorChange: (v: PrimeColor) => void;
  sharedSliderIndex: number;
  onSliderIndexChange: (i: number) => void;
  primingRepaintMap: Record<number, string>;
  colorRepaintMap: Record<number, string>;
}

function OptionButtons<T extends string>({
  label,
  options,
  value,
  onChange,
}: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-2">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              value === o.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const columnLabelStyle: React.CSSProperties = {
  fontFamily: `'${randomFont}', sans-serif`,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

export function ColorPlanPanel({
  extractedColors,
  selectedTheme,
  colorSchemes,
  baseOverride,
  midtoneOverrides,
  highlightOverride,
  onThemeSelect,
  onBaseChange,
  onMidtoneChange,
  onHighlightChange,
  images,
  recolorMap,
  activePrompt,
  onPromptChange,
  onSubmitRepaint,
  currentlyRepainting,
  submitError,
  pipelineComplete,
  zenithalEnabled,
  primeColor,
  onPrimeColorChange,
  sharedSliderIndex,
  onSliderIndexChange,
  primingRepaintMap,
  colorRepaintMap,
}: ColorPlanPanelProps) {
  const primaryHex = extractedColors[0] || '#666666';

  const mainImages = images.filter(i => i.type === 'main');

  const slides: SliderImage[] = useMemo(() => {
    return mainImages.map(img => {
      const recolored = recolorMap[img.id] ?? null;
      return {
        id: img.id,
        src: recolored || img.objectUrl,
        badgeLeft: 'Main',
        badgeRight: recolored ? 'Recolored' : 'Awaiting scheme',
        badgeRightAccent: !!recolored,
      };
    });
  }, [mainImages, recolorMap]);

  const activeScheme = colorSchemes[0];
  const swatches = [
    activeScheme?.base && {
      label: 'Base',
      hex: baseOverride
        ? (SPEEDPAINT_MOST_WANTED.find(p => p.name === baseOverride)?.hex ?? activeScheme.base.hex)
        : activeScheme.base.hex,
      name: baseOverride ?? activeScheme.base.name,
    },
    activeScheme?.midtone1 && {
      label: 'Mid',
      hex: midtoneOverrides[0]
        ? (SPEEDPAINT_MOST_WANTED.find(p => p.name === midtoneOverrides[0])?.hex ?? activeScheme.midtone1.hex)
        : activeScheme.midtone1.hex,
      name: midtoneOverrides[0] ?? activeScheme.midtone1.name,
    },
    activeScheme?.highlight && {
      label: 'High',
      hex: highlightOverride
        ? (SPEEDPAINT_MOST_WANTED.find(p => p.name === highlightOverride)?.hex ?? activeScheme.highlight.hex)
        : activeScheme.highlight.hex,
      name: highlightOverride ?? activeScheme.highlight.name,
    },
  ].filter(Boolean) as { label: string; hex: string; name: string }[];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Color plan</h2>
        <p className="text-sm text-muted-foreground">Choose a mood and build your palette.</p>
      </div>

      {/* Image display — DualSlider when pipeline complete, ImageSlider otherwise */}
      {pipelineComplete ? (
        <DualSlider
          leftImages={mainImages.map((_, i) => ({
            src: primingRepaintMap[i] ?? '',
            label: 'Primed',
          }))}
          rightImages={mainImages.map((_, i) => ({
            src: colorRepaintMap[i] ?? '',
            label: 'Repainted',
          }))}
          sharedIndex={sharedSliderIndex}
          onIndexChange={onSliderIndexChange}
          primingHint={
            (zenithalEnabled ? 'Zenithal · ' : '') +
            (primeColor === 'white' ? 'White' : primeColor === 'black' ? 'Black' : 'Grey')
          }
          colorSwatches={swatches}
        />
      ) : (
        slides.length > 0 && <ImageSlider slides={slides} />
      )}

      {/* Paint Directive */}
      {pipelineComplete && (
        <PaintDirectivePanel
          activePrompt={activePrompt}
          onPromptChange={onPromptChange}
          onSubmit={onSubmitRepaint}
          currentlyRepainting={currentlyRepainting}
          submitError={submitError}
          zenithalEnabled={zenithalEnabled}
          primeColor={primeColor}
        />
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* LEFT — Palette & Analysis */}
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={columnLabelStyle}>
            <Layers className="w-3.5 h-3.5" />
            <span>Palette &amp; analysis</span>
          </div>

          {/* Extracted colors */}
          {extractedColors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Extracted colors</h3>
              <div className="flex gap-1.5">
                {extractedColors.map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          )}

          {/* Prime colour selector */}
          <OptionButtons<PrimeColor>
            label="Prime colour"
            options={[
              { value: 'black', label: 'Black' },
              { value: 'grey', label: 'Grey' },
              { value: 'white', label: 'White' },
            ]}
            value={primeColor as PrimeColor}
            onChange={onPrimeColorChange}
          />

          {/* Theme */}
          <ThemeSelector selected={selectedTheme} onSelect={onThemeSelect} />

          {/* Schemes */}
          {colorSchemes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated schemes</h3>
              {colorSchemes.map((s, i) => (
                <SchemeCard key={i} scheme={s} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Color & Theory */}
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={columnLabelStyle}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Color &amp; theory</span>
          </div>

          {/* Color theory FIRST */}
          <ColorTheoryHelper baseHex={primaryHex} />

          {/* Role overrides SECOND */}
          <ColorRoleSelector
            baseOverride={baseOverride}
            midtoneOverrides={midtoneOverrides}
            highlightOverride={highlightOverride}
            onBaseChange={onBaseChange}
            onMidtoneChange={onMidtoneChange}
            onHighlightChange={onHighlightChange}
          />
        </div>
      </div>
    </div>
  );
}
