import { cn } from '@/lib/utils';

interface SprayViabilityBadgeProps {
  temp: number | null;
}

export function SprayViabilityBadge({ temp }: SprayViabilityBadgeProps) {
  if (temp === null) return null;

  const viable = temp > 15;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
      viable
        ? 'bg-success/15 text-success'
        : 'bg-warning/15 text-warning'
    )}>
      <span className={cn('w-2 h-2 rounded-full', viable ? 'bg-success' : 'bg-warning')} />
      {viable ? 'Spray viable' : 'Spray not recommended'}
    </span>
  );
}
