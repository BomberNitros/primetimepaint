import { ColorScheme } from '@/types/primetime';
import { PaintLidBadge } from './PaintLidBadge';

interface SchemeCardProps {
  scheme: ColorScheme;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}

export function SchemeCard({ scheme, index, isActive, onSelect }: SchemeCardProps) {
  const colors = [
    { role: 'Base', paint: scheme.base },
    { role: 'Midtone 1', paint: scheme.midtone1 },
    ...(scheme.midtone2 ? [{ role: 'Midtone 2', paint: scheme.midtone2 }] : []),
    { role: 'Highlight', paint: scheme.highlight },
  ];

  return (
    <div onClick={onSelect} className={`rounded-xl border bg-card p-4 cursor-pointer transition-colors ${isActive ? 'border-primary' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">Scheme {index + 1}</h4>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary capitalize">
          {scheme.type.replace('-', ' ')}
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {colors.map(c => (
          <div
            key={c.role}
            className="flex-1 h-10 rounded-md"
            style={{ backgroundColor: c.paint.hex }}
            title={`${c.role}: ${c.paint.name}`}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {colors.map(c => (
          <div key={c.role} className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: c.paint.hex }} />
            <PaintLidBadge color={c.paint.lidColor} />
            <span className="text-muted-foreground">{c.role}:</span>
            <span className="text-foreground font-medium">{c.paint.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
