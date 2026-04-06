import { RepaintEntry } from '@/types/primetime';
import { cn } from '@/lib/utils';

const FREE_TIER_CEILING = 100;
const FREE_TIER_ACTIVE = true;
const COST_PER_REPAINT = 0.072;

const DOT_COLORS: Record<RepaintEntry['section'], string> = {
  initial: 'bg-purple-500',
  priming: 'bg-blue-500',
  colorPlan: 'bg-purple-500',
};

interface RepaintTickerProps {
  repaintLog: RepaintEntry[];
}

export function RepaintTicker({ repaintLog }: RepaintTickerProps) {
  if (repaintLog.length === 0) return null;

  const count = repaintLog.length;
  const pct = (count / FREE_TIER_CEILING) * 100;
  const barColor = pct >= 95 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-purple-500';
  const cost = (count * COST_PER_REPAINT).toFixed(3);

  const reversed = [...repaintLog].reverse();

  return (
    <div className="border-t border-border bg-card p-4 space-y-2 border-l-2 border-primary">
      <div className="text-xs text-muted-foreground font-semibold">
        {count} / {FREE_TIER_CEILING}
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="text-xs text-foreground">
        €{cost}{FREE_TIER_ACTIVE ? ' (free tier)' : ''}
      </div>

      <div className="max-h-[112px] overflow-y-auto space-y-1">
        {reversed.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', DOT_COLORS[entry.section])} />
            <span className="capitalize">{entry.section}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>{entry.elapsedSeconds}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
