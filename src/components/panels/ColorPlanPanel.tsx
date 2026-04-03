import { ThemeSelector } from '@/components/ThemeSelector';
import { ColourRoleSelector } from '@/components/ColourRoleSelector';
import { ColourTheoryHelper } from '@/components/ColourTheoryHelper';
import { SchemeCard } from '@/components/SchemeCard';
import { ImageSlider } from '@/components/ImageSlider';
import { ThemeId, ColorScheme, UploadedImage } from '@/types/primetime';
import { Layers, SlidersHorizontal } from 'lucide-react';
import { randomFont } from '@/components/ControlRail';

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
}: ColorPlanPanelProps) {
  const primaryHex = extractedColors[0] || '#666666';

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Colour Plan</h2>
        <p className="text-sm text-muted-foreground">Choose a mood and build your palette.</p>
      </div>

      {/* Image slider — full width */}
      {images.length > 0 && (
        <ImageSlider images={images} recolorMap={recolorMap} />
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* LEFT — Palette & Analysis */}
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={columnLabelStyle}>
            <Layers className="w-3.5 h-3.5" />
            <span>Palette &amp; Analysis</span>
          </div>

          {/* Extracted colours */}
          {extractedColors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Extracted Colours</h3>
              <div className="flex gap-1.5">
                {extractedColors.map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          )}

          {/* Theme */}
          <ThemeSelector selected={selectedTheme} onSelect={onThemeSelect} />

          {/* Schemes */}
          {colorSchemes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated Schemes</h3>
              {colorSchemes.map((s, i) => (
                <SchemeCard key={i} scheme={s} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Colour & Theory */}
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={columnLabelStyle}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Colour &amp; Theory</span>
          </div>

          {/* Colour theory FIRST */}
          <ColourTheoryHelper baseHex={primaryHex} />

          {/* Role overrides SECOND */}
          <ColourRoleSelector
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
