import { MediumRatioVisualizer } from '@/components/MediumRatioVisualizer';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const RATIO_PRESETS: {
  label: string;
  ratio: [number, number];
  desc: string;
  detail: string;
}[] = [
  {
    label: '50/50',
    ratio: [50, 50],
    desc: 'Standard thinning — good for basecoats over zenithal',
    detail: `Equal parts Speedpaint and Medium creates the standard working consistency for most painting tasks. At this ratio the paint flows freely off the brush and self-levels into recesses, producing smooth coverage with minimal visible brush strokes. The pigment density is high enough to establish solid colour in a single pass over a zenithal undercoat, while the medium component keeps the paint open long enough to work a full panel before it begins to set. This is the default ratio most painters should start with before adjusting up or down.

To reach a 50/50 mix, load your brush with Speedpaint and then dip the tip into your medium pot to roughly the same depth. Test on your thumbnail or a palette — the paint should flow like whole milk, leaving a translucent but clearly coloured trail. If it beads up or feels sticky, add a touch more medium. If it runs uncontrollably, add more paint. On the model this ratio works best for large flat areas like cloaks, armour panels, and skin — anywhere you want even coverage without obscuring the zenithal gradient underneath. Common mistakes include loading too much paint on the brush, which causes pooling in recesses and tide-mark staining, or rushing back over a drying area, which reactivates the Speedpaint and pulls pigment away. If you see tide marks forming, leave them — they're easier to fix with a second thin coat than by chasing wet paint. This ratio is less suitable for very fine detail work where you need more control, or for glazing effects where you want near-transparency.`,
  },
  {
    label: '75/25',
    ratio: [75, 25],
    desc: 'Slightly thinned — more pigment density for coverage',
    detail: `A 75/25 Speedpaint-to-Medium mix gives you the highest pigment density you can use while still benefiting from the medium's flow-improving properties. The paint will feel noticeably thicker on the brush than a 50/50 mix and will not self-level as aggressively, which gives you more control over exactly where the colour goes. This ratio is ideal when painting over a dark primer where you need the colour to assert itself quickly, or when covering areas that demand strong opaque coverage in as few coats as possible — for example, bright reds over black, or yellows that tend to look washed out at thinner ratios.

To mix this in practice, load a full brush of Speedpaint and add only a small touch of medium — roughly a quarter of the paint volume on your brush. The consistency should be closer to single cream than milk: it flows, but with visible body. Test by drawing a line on your thumbnail — you should see strong colour with minimal transparency. On the model, apply to one area at a time and avoid going back over a stroke. Because the paint is thicker, brush marks are more likely to remain visible if you overwork it. Let gravity and capillary action do the work rather than scrubbing the brush back and forth. This ratio is not appropriate for glazing, tinting, or any technique where transparency is desired — it will produce a near-opaque coat that obscures the underlying zenithal. It's also risky on highly textured surfaces where thicker paint can fill shallow detail and obscure fine sculpting. If you notice detail loss, drop to 50/50 or thinner for subsequent coats.`,
  },
  {
    label: '25/75',
    ratio: [25, 75],
    desc: 'Heavy thinning — glazing and filters',
    detail: `At 25/75 Speedpaint-to-Medium, you are working with a glaze — a highly translucent wash of colour that tints the surface rather than covering it. The medium dominates the mix, so the paint flows extremely freely and will seek out every recess and crevice on the model. Each coat deposits only a whisper of colour, which makes this ratio ideal for building up smooth gradients through multiple thin layers, shifting the colour temperature of an area without hiding the work underneath, or adding tinted shadows and filters over a completed zenithal.

To mix this, start with a loaded brush of medium and add just a touch of Speedpaint — you want the mixture to look barely tinted on your palette. Test on your thumbnail: you should see colour, but the skin underneath should be clearly visible through it. On the model, apply in a single confident stroke and let the glaze flow naturally. Do not go back over it. Because the paint is so thin, pooling becomes hard to control — if too much collects in a recess, wick it away immediately with a clean damp brush. Build up colour gradually across two or three coats rather than trying to get coverage in one. Common mistakes include applying too much at once (which creates coffee-staining where pigment collects at the drying edge), reactivating previous layers by scrubbing, and expecting coverage from a single pass. This ratio is not appropriate for basecoating or for any area where you need solid opaque colour — it will never build to full opacity without an unacceptable number of coats. Use it after your base colours are established, as a finishing technique for colour modulation and atmosphere.`,
  },
];

export function PaintPlanPanel() {
  const [selectedRatio, setSelectedRatio] = useState(0);
  const preset = RATIO_PRESETS[selectedRatio];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Thinning & Application</h2>
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
        <p className="text-xs text-muted-foreground">{preset.desc}</p>

        {/* Expanded guidance */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
            {preset.detail}
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
