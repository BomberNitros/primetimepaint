import { cn } from '@/lib/utils';
import { LidColor } from '@/types/primetime';

const LID_STYLES: Record<LidColor, string> = {
  white: 'bg-white border-muted-foreground/30',
  green: 'bg-emerald-500 border-emerald-600',
  red: 'bg-red-500 border-red-600',
  black: 'bg-zinc-900 border-zinc-700',
};

const LID_LABELS: Record<LidColor, string> = {
  white: 'Acrylic / Triad',
  green: 'Effects',
  red: 'Washes',
  black: 'Metallics',
};

interface PaintLidBadgeProps {
  color: LidColor;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function PaintLidBadge({ color, showLabel = false, size = 'sm' }: PaintLidBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn(
        'rounded-full border',
        LID_STYLES[color],
        size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
      )} />
      {showLabel && <span className="text-xs text-muted-foreground">{LID_LABELS[color]}</span>}
    </span>
  );
}
