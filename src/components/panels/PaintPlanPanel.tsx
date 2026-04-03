import { MediumRatioVisualizer } from '@/components/MediumRatioVisualizer';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { randomFont } from '@/components/ControlRail';

const RATIO_PRESETS: {
  label: string;
  ratio: [number, number];
  intro: string;
  bullets: { emoji: string; text: string }[];
}[] = [
  {
    label: '50/50',
    ratio: [50, 50],
    intro: 'Equal parts Speedpaint and Medium — the standard working consistency for most painting tasks.',
    bullets: [
      { emoji: '🎯', text: 'Produces smooth, self-levelling coverage that flows into recesses naturally without pooling.' },
      { emoji: '🧪', text: 'Load brush with Speedpaint, dip tip into medium to same depth. Test on thumbnail — should flow like whole milk.' },
      { emoji: '🖌️', text: 'Paint feels fluid on the brush with visible body. It should glide off the tip, not drip or cling.' },
      { emoji: '🎨', text: 'Self-levels on the model into a smooth, even coat. Zenithal gradient remains visible underneath.' },
      { emoji: '⚠️', text: 'Overloading the brush causes tide marks and pooling. If you see staining, leave it — fix with a second thin coat.' },
      { emoji: '✅', text: 'Use for large flat surfaces: cloaks, armour panels, skin — anywhere you want even basecoat coverage.' },
      { emoji: '❌', text: 'Not ideal for fine detail work or glazing — too opaque for tinting, not controlled enough for eyes or gems.' },
      { emoji: '💡', text: 'If paint beads up, add more medium. If it runs uncontrollably, add more Speedpaint. Adjust on your palette, not the model. On a wet palette, work quickly — passive moisture will thin this mix further within minutes. Reload from the bottle rather than letting the mix sit.' },
    ],
  },
  {
    label: '75/25',
    ratio: [75, 25],
    intro: 'Highest pigment density with flow improvement — for strong coverage over dark primers.',
    bullets: [
      { emoji: '🎯', text: 'Delivers near-opaque coverage in a single pass. Asserts colour quickly over black or dark undercoats.' },
      { emoji: '🧪', text: 'Full brush of Speedpaint plus a small touch of medium — roughly a quarter of the paint volume. Consistency like single cream.' },
      { emoji: '🖌️', text: "Noticeably thicker on the brush. Doesn't self-level as aggressively — gives more placement control." },
      { emoji: '🎨', text: 'Applies as a strong, near-opaque coat. Brush marks may remain visible if overworked — apply and leave.' },
      { emoji: '⚠️', text: 'Scrubbing back and forth creates visible strokes. Let gravity and capillary action do the work.' },
      { emoji: '✅', text: 'Best for bright reds over black, yellows that wash out thinner, and any area needing fast opaque coverage.' },
      { emoji: '❌', text: 'Not for glazing, tinting, or textured surfaces — too thick, risks filling shallow detail.' },
      { emoji: '💡', text: 'Apply to one area at a time and move on. Speed and confidence matter more than perfection at this ratio.' },
    ],
  },
  {
    label: '25/75',
    ratio: [25, 75],
    intro: 'Heavy medium, minimal pigment — a true glaze for tinting, filtering, and building gradients.',
    bullets: [
      { emoji: '🎯', text: 'Deposits a whisper of colour per coat. Builds smooth gradients through multiple thin layers.' },
      { emoji: '🧪', text: 'Start with a loaded brush of medium, add a small touch of Speedpaint. Mixture should look barely tinted on the palette.' },
      { emoji: '🖌️', text: 'Extremely fluid — flows freely off the brush. Almost water-like but with a slight colour tint.' },
      { emoji: '🎨', text: 'Seeks every recess and crevice. Each pass shifts colour temperature without hiding the work underneath.' },
      { emoji: '⚠️', text: 'Too much at once causes coffee-staining at drying edges. Apply sparingly and wick excess with a clean damp brush.' },
      { emoji: '✅', text: 'Use after base colours are down — for colour modulation, tinted shadows, atmospheric filters, and transitions.' },
      { emoji: '❌', text: 'Never use for basecoating. Will never build to full opacity without an impractical number of coats.' },
      { emoji: '💡', text: 'Build up across 2–3 passes rather than trying to get visible colour in one. Patience is the technique.' },
    ],
  },
];

export function PaintPlanPanel() {
  const [selectedRatio, setSelectedRatio] = useState(0);
  const preset = RATIO_PRESETS[selectedRatio];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Thinning & application</h2>
        <p className="text-sm text-muted-foreground">Plan your medium ratios and application technique.</p>
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

        {/* Scannable ratio content */}
        <div className="pt-2 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground">{preset.intro}</p>
          <ul className="space-y-2">
            {preset.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="flex-shrink-0 text-sm">{b.emoji}</span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
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
