import { MediumRatioVisualizer } from '@/components/MediumRatioVisualizer';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const RATIO_PRESETS: {
  label: string;
  ratio: [number, number];
  desc: string;
  explanation: string;
  example: string;
  consequence: string;
}[] = [
  {
    label: '50/50',
    ratio: [50, 50],
    desc: 'Standard thinning — good for basecoats over zenithal',
    explanation: 'Equal parts Speedpaint and Medium. The paint flows freely and self-levels into recesses.',
    example: 'Use for base-coating large flat areas where you want even coverage with minimal brush marks.',
    consequence: 'Too thick: brush strokes stay visible. Too thin: colour goes transparent.',
  },
  {
    label: '75/25',
    ratio: [75, 25],
    desc: 'Slightly thinned — more pigment density for coverage',
    explanation: 'Mostly paint with a small amount of Medium. Higher pigment density gives stronger coverage in fewer coats.',
    example: 'Use when painting over a dark primer where you need the colour to assert itself, or for areas that need solid opaque coverage.',
    consequence: 'Too thick: paint won\'t self-level and can obscure fine detail. Too thin: you lose the coverage advantage and need extra coats.',
  },
  {
    label: '25/75',
    ratio: [25, 75],
    desc: 'Heavy thinning — glazing and filters',
    explanation: 'Mostly Medium with a touch of pigment. Creates a translucent wash that tints rather than covers.',
    example: 'Use for glazing colour shifts over a zenithal, tinting recesses, or building up colour gradually through multiple thin layers.',
    consequence: 'Too thick: defeats the purpose — you get a weak basecoat instead of a glaze. Too thin: colour barely registers and pooling becomes hard to control.',
  },
];

export function PaintPlanPanel() {
  const [selectedRatio, setSelectedRatio] = useState(0);
  const preset = RATIO_PRESETS[selectedRatio];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Thinning Plan</h2>
        <p className="text-sm text-muted-foreground">Plan your medium ratios and layering order.</p>
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
        <MediumRatioVisualizer ratio={preset.ratio} />
        <p className="text-xs text-muted-foreground">{preset.desc}</p>

        {/* Expanded contextual content */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div>
            <p className="text-xs font-medium text-foreground mb-1">What it does</p>
            <p className="text-xs text-muted-foreground">{preset.explanation}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-1">When to use</p>
            <p className="text-xs text-muted-foreground">{preset.example}</p>
          </div>
          <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-warning">{preset.consequence}</p>
          </div>
        </div>
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
