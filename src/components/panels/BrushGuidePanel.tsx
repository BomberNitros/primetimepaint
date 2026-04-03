import { BRUSH_RECOMMENDATIONS } from '@/data/brushes';
import { BrushSvg } from '@/components/BrushSvg';
import { BrushType } from '@/types/primetime';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { randomFont } from '@/components/ControlRail';

const BRUSH_USE_CASES: Record<BrushType, string> = {
  round: 'Versatile pointed tip for basecoating, layering, and detail.',
  flat: 'Wide flat edge ideal for drybrushing and broad strokes.',
  filbert: 'Rounded flat tip for smooth blending and transitions.',
  liner: 'Extra-long thin bristles for fine lines and script work.',
  angle: 'Angled tip for precise edge highlighting and controlled strokes.',
  spot: 'Short stiff bristles for precise dot placement and stippling.',
};

export function BrushGuidePanel() {
  const [selectedBrush, setSelectedBrush] = useState<{ type: BrushType; name: string } | null>(null);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Brush guide</h2>
        <p className="text-sm text-muted-foreground">Match each painting task to the right brush from your sets.</p>
      </div>

      <div className="space-y-2">
        {BRUSH_RECOMMENDATIONS.map((rec) => (
          <div key={rec.task} className="p-3 rounded-xl bg-card border border-border">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setSelectedBrush({ type: rec.brushType, name: rec.brush })}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                title={`View ${rec.brush}`}
              >
                <BrushSvg type={rec.brushType} size={22} />
              </button>
              <div className="flex-1 min-w-0">
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

      {/* Brush lightbox */}
      <Dialog open={!!selectedBrush} onOpenChange={() => setSelectedBrush(null)}>
        <DialogContent className="sm:max-w-xs">
          {selectedBrush && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBrush.name}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <BrushSvg type={selectedBrush.type} size={96} className="text-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  {BRUSH_USE_CASES[selectedBrush.type]}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
