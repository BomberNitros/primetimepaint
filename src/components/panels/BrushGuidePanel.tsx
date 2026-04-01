import { BRUSH_RECOMMENDATIONS } from '@/data/brushes';

export function BrushGuidePanel() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Brush Guide</h2>
        <p className="text-sm text-muted-foreground">Match each painting task to the right brush from your sets.</p>
      </div>

      <div className="space-y-2">
        {BRUSH_RECOMMENDATIONS.map((rec) => (
          <div key={rec.task} className="p-3 rounded-xl bg-card border border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{rec.task}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rec.tip}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-primary">{rec.brush}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{rec.set.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
