import { useMemo } from 'react';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ColorRoleSelector } from '@/components/ColorRoleSelector';
import { ColorTheoryHelper } from '@/components/ColorTheoryHelper';
import { SchemeCard } from '@/components/SchemeCard';
import { ImageSlider, SliderImage } from '@/components/ImageSlider';
import { DualSlider } from '@/components/DualSlider';
import { PaintDirectivePanel } from '@/components/PaintDirectivePanel';
import { Textarea } from '@/components/ui/textarea';
import { ThemeId, ColorScheme, UploadedImage, PrimeColor } from '@/types/primetime';
import { cn } from '@/lib/utils';
import { Layers, SlidersHorizontal } from 'lucide-react';
import { randomFont } from '@/components/ControlRail';
import { SPEEDPAINT_MOST_WANTED } from '@/data/speedpaints';

interface ColorPlanPanelProps {
  extractedColors: string[];
  selectedTheme: ThemeId | null;
  colorSchemes: ColorScheme[];
  activeSchemeIndex: number;
  onSchemeSelect: (i: number) => void;
  baseOverride: string | null;
  midtoneOverrides: string[];
  highlightOverride: string | null;
  onThemeSelect: (t: ThemeId) => void;
  onBaseChange: (v: string | null) => void;
  onMidtoneChange: (v: string[]) => void;
  onHighlightChange: (v: string | null) => void;
  images: UploadedImage[];
  recolorMap: Record<string, string | null>;
  assembledPrompt: string;
  miniature: {
    name: string; setName: (v: string) => void;
    origin: string; setOrigin: (v: string) => void;
    manufacturer: string; setManufacturer: (v: string) => void;
    role: string; setRole: (v: string) => void;
    customRole: string; setCustomRole: (v: string) => void;
  };
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
  activePrompt: string | null;
  onPromptChange: (p: string) => void;
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
  activeSchemeIndex,
  onSchemeSelect,
  baseOverride,
  midtoneOverrides,
  highlightOverride,
  onThemeSelect,
  onBaseChange,
  onMidtoneChange,
  onHighlightChange,
  images,
  recolorMap,
  assembledPrompt,
  miniature,
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
  activePrompt,
  onPromptChange,
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
        badgeRight: recolored ? 'Recoloured' : 'Awaiting scheme',
        badgeRightAccent: !!recolored,
      };
    });
  }, [mainImages, recolorMap]);

  const activeScheme = colorSchemes?.[activeSchemeIndex];
  const swatches = activeScheme ? [
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
    activeScheme?.midtone2 && {
      label: 'Mid 2',
      hex: activeScheme.midtone2.hex,
      name: activeScheme.midtone2.name,
    },
    activeScheme?.highlight && {
      label: 'High',
      hex: highlightOverride
        ? (SPEEDPAINT_MOST_WANTED.find(p => p.name === highlightOverride)?.hex ?? activeScheme.highlight.hex)
        : activeScheme.highlight.hex,
      name: highlightOverride ?? activeScheme.highlight.name,
    },
  ].filter(Boolean) as { label: string; hex: string; name: string }[] : [];

  return (
    <div className="space-y-6">
      {/* 1. Title */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Colour plan</h2>
        <p className="text-sm text-muted-foreground">Choose a mood and build your palette.</p>
      </div>

      {/* 2. Image display */}
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

      {/* 3. Paint directive */}
      {pipelineComplete && (
        <PaintDirectivePanel
          assembledPrompt={assembledPrompt}
          miniature={miniature}
        />
      )}

      {/* 4. Editable repaint prompt */}
      {pipelineComplete && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Repaint prompt</h3>
          <p className="text-xs text-muted-foreground">Leave empty to use the automatic prompt. Anything typed here replaces it entirely.</p>
          <Textarea
            value={activePrompt ?? ''}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>
      )}

      {/* 5. Submit button + error (outside directive panel) */}
      {pipelineComplete && (
        <div className="space-y-2">
          <button
            type="button"
            className="w-full py-2 text-xs font-medium rounded border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            onClick={onSubmitRepaint}
            disabled={currentlyRepainting || !assembledPrompt}
          >
            {currentlyRepainting ? 'Repainting…' : 'Apply paint directive'}
          </button>
          {submitError && (
            <p className="text-xs text-destructive">{submitError}</p>
          )}
        </div>
      )}

      {/* 5. Disclaimer */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Color selections are first added paint directive above. Apply a new directive to repaint images and see new paints!
      </p>

      {/* 6. Schemes row */}
      {colorSchemes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schemes</h3>
          <p className="text-xs text-muted-foreground">Extracted reference-based paint plan shown as the baseline set of colors.</p>
          <div className="grid grid-cols-3 gap-4">
            {colorSchemes.map((s, i) => (
              <SchemeCard key={i} scheme={s} index={i} isActive={i === activeSchemeIndex} onSelect={() => onSchemeSelect(i)} />
            ))}
          </div>
        </div>
      )}

      {/* 7. Two-column row */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* LEFT — Palette */}
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={columnLabelStyle}>
            <Layers className="w-3.5 h-3.5" />
            <span>Palette</span>
          </div>

          {/* Priming color */}
          <OptionButtons<PrimeColor>
            label="Priming color"
            options={[
              { value: 'black', label: 'Black' },
              { value: 'grey', label: 'Grey' },
              { value: 'white', label: 'White' },
            ]}
            value={primeColor as PrimeColor}
            onChange={onPrimeColorChange}
          />

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

          {/* Theme */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</h3>
            <p className="text-xs text-muted-foreground">Stylistic interpretation applied on top of the baseline to generate a themed variation.</p>
            <ThemeSelector selected={selectedTheme} onSelect={onThemeSelect} />
          </div>
        </div>

        {/* RIGHT — Colour & theory */}
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={columnLabelStyle}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Colour &amp; theory</span>
          </div>

          {/* Color theory */}

          {/* Colour theory */}
          <ColorTheoryHelper baseHex={primaryHex} />

          {/* Colour overrides */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Manual colour replacements for specific paint roles or areas.</p>
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
    </div>
  );
}
