import { MediumRatioVisualizer } from '@/components/MediumRatioVisualizer';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const RATIO_PRESETS: { label: string; ratio: [number, number]; desc: string }[] = [
  { label: '50/50', ratio: [50, 50], desc: 'Standard thinning — good for basecoats over zenithal' },
  { label: '75/25', ratio: [75, 25], desc: 'Slightly thinned — more pigment density for coverage' },
  { label: '25/75', ratio: [25, 75], desc: 'Heavy thinning — glazing and filters' },
];

export function PaintPlanPanel() {
  const [selectedRatio, setSelectedRatio] = useState(0);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Paint Plan</h2>
        <p className="text-sm text-muted-foreground">Plan your painting order and medium ratios.</p>
      </div>

      {/* Medium ratio */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <h3 className="text-sm font-medium text-foreground">Speedpaint Medium Ratio</h3>
        <div className="flex gap-2">
          {RATIO_PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setSelectedRatio(i)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                i === selectedRatio
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <MediumRatioVisualizer ratio={RATIO_PRESETS[selectedRatio].ratio} />
        <p className="text-xs text-muted-foreground">{RATIO_PRESETS[selectedRatio].desc}</p>
      </div>

      {/* Layering guidance */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-3">
        <h3 className="text-sm font-medium text-foreground">Recommended layer order</h3>
        <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
          <li><span className="text-foreground font-medium">Base areas first</span> — largest surfaces, darkest colours</li>
          <li><span className="text-foreground font-medium">Midtones</span> — raised areas and transitions</li>
          <li><span className="text-foreground font-medium">Highlights</span> — uppermost edges, sharpest points</li>
          <li><span className="text-foreground font-medium">Details</span> — eyes, gems, buckles, weapon edges</li>
          <li><span className="text-foreground font-medium">Basing</span> — last to avoid accidental paint on the base</li>
        </ol>
      </div>
    </div>
  );
}
