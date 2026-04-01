interface MediumRatioVisualizerProps {
  ratio: [number, number]; // [paint, medium]
}

export function MediumRatioVisualizer({ ratio }: MediumRatioVisualizerProps) {
  const total = ratio[0] + ratio[1];
  const paintPct = (ratio[0] / total) * 100;
  const mediumPct = (ratio[1] / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Paint {ratio[0]}%</span>
        <span className="text-muted-foreground/40">|</span>
        <span>Medium {ratio[1]}%</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden flex bg-muted">
        <div
          className="bg-primary transition-all"
          style={{ width: `${paintPct}%` }}
        />
        <div
          className="bg-muted-foreground/30 transition-all"
          style={{ width: `${mediumPct}%` }}
        />
      </div>
    </div>
  );
}
