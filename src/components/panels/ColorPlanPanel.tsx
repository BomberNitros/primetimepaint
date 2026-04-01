import { ThemeSelector } from '@/components/ThemeSelector';
import { ColourRoleSelector } from '@/components/ColourRoleSelector';
import { ColourTheoryHelper } from '@/components/ColourTheoryHelper';
import { SchemeCard } from '@/components/SchemeCard';
import { ThemeId, ColorScheme } from '@/types/primetime';

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
}

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
}: ColorPlanPanelProps) {
  const primaryHex = baseOverride
    ? (extractedColors[0] || '#666666')
    : (extractedColors[0] || '#666666');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Colour Plan</h2>
        <p className="text-sm text-muted-foreground">Choose a mood and build your palette.</p>
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

      {/* Role overrides */}
      <ColourRoleSelector
        baseOverride={baseOverride}
        midtoneOverrides={midtoneOverrides}
        highlightOverride={highlightOverride}
        onBaseChange={onBaseChange}
        onMidtoneChange={onMidtoneChange}
        onHighlightChange={onHighlightChange}
      />

      {/* Schemes */}
      {colorSchemes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated Schemes</h3>
          {colorSchemes.map((s, i) => (
            <SchemeCard key={i} scheme={s} index={i} />
          ))}
        </div>
      )}

      {/* Colour theory */}
      <ColourTheoryHelper baseHex={primaryHex} />
    </div>
  );
}
