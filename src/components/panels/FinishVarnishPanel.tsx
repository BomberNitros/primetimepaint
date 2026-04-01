import { ShieldCheck, Sparkles, Spray, PaintBucket } from 'lucide-react';

const items = [
  {
    title: 'Varnish is mandatory for Speedpaints',
    desc: 'Speedpaints reactivate when wet. A varnish coat protects the paint job from handling, washes, and further layers. Apply after all painting is complete.',
    icon: ShieldCheck,
  },
  {
    title: 'Matte vs Satin vs Gloss',
    desc: (
      <>
        <span className="text-foreground">Matte:</span> Best for most miniatures — reduces shine, natural look.<br/>
        <span className="text-foreground">Satin:</span> Slight sheen — good for leather, cloth.<br/>
        <span className="text-foreground">Gloss:</span> Use selectively on gems, eyes, wet effects.
      </>
    ),
    icon: Sparkles,
  },
  {
    title: 'Spray varnish technique',
    desc: 'Short bursts at 20–25cm distance. Same temperature rules as priming — above 15°C, low humidity. Two thin coats are better than one thick coat. Allow 30 minutes between coats.',
    icon: Spray,
  },
  {
    title: 'Brush-on varnish',
    desc: "Use a clean, dedicated brush. Thin slightly with water. Apply in one direction — don't scrub back and forth or you'll reactivate the Speedpaint underneath.",
    icon: PaintBucket,
  },
];

export function FinishVarnishPanel() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Finish & Varnish</h2>
        <p className="text-sm text-muted-foreground">Protect your work and set the final look.</p>
      </div>

      <div className="space-y-2">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-3 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
