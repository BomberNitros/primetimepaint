export function PaintHandlingPanel() {
  const tips = [
    { title: 'Shake your paints', desc: 'Shake Speedpaints vigorously for 2+ minutes before every use. The medium and pigment separate quickly.' },
    { title: 'Consistency check', desc: 'Speedpaints should flow off the brush like milk — not water, not yoghurt. Test on your thumbnail first.' },
    { title: 'One thick coat myth', desc: 'Despite the name, apply in controlled amounts. Flooding recesses causes pooling and tide marks.' },
    { title: 'Work in sections', desc: 'Apply to one area at a time. Speedpaints reactivate when wet, so avoid going back over drying areas.' },
    { title: 'Clean brush between colours', desc: 'Speedpaints stain brushes fast. Rinse thoroughly and reshape the tip before switching colours.' },
    { title: 'Palette discipline', desc: 'Use a wet palette to keep Speedpaints workable. They dry faster than traditional acrylics on dry palettes.' },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Paint Handling</h2>
        <p className="text-sm text-muted-foreground">Handling tips specific to Speedpaints.</p>
      </div>

      <div className="space-y-2">
        {tips.map(t => (
          <div key={t.title} className="p-3 rounded-xl bg-card border border-border">
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
