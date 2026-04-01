export function FinishVarnishPanel() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Finish & Varnish</h2>
        <p className="text-sm text-muted-foreground">Protect your work and set the final look.</p>
      </div>

      <div className="space-y-2">
        <div className="p-3 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-foreground">Varnish is mandatory for Speedpaints</p>
          <p className="text-xs text-muted-foreground mt-1">
            Speedpaints reactivate when wet. A varnish coat protects the paint job from handling, washes, and further layers. Apply after all painting is complete.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-foreground">Matte vs Satin vs Gloss</p>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-foreground">Matte:</span> Best for most miniatures — reduces shine, natural look.<br/>
            <span className="text-foreground">Satin:</span> Slight sheen — good for leather, cloth.<br/>
            <span className="text-foreground">Gloss:</span> Use selectively on gems, eyes, wet effects.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-foreground">Spray varnish technique</p>
          <p className="text-xs text-muted-foreground mt-1">
            Short bursts at 20–25cm distance. Same temperature rules as priming — above 15°C, low humidity. Two thin coats are better than one thick coat. Allow 30 minutes between coats.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-foreground">Brush-on varnish</p>
          <p className="text-xs text-muted-foreground mt-1">
            Use a clean, dedicated brush. Thin slightly with water. Apply in one direction — don't scrub back and forth or you'll reactivate the Speedpaint underneath.
          </p>
        </div>
      </div>
    </div>
  );
}
