import { SPEEDPAINT_MOST_WANTED } from '@/data/speedpaints';
import { cn } from '@/lib/utils';

interface ColourRoleSelectorProps {
  baseOverride: string | null;
  midtoneOverrides: string[];
  highlightOverride: string | null;
  onBaseChange: (v: string | null) => void;
  onMidtoneChange: (v: string[]) => void;
  onHighlightChange: (v: string | null) => void;
}

function PaintPicker({
  label,
  constraint,
  selected,
  onToggle,
}: {
  label: string;
  constraint: string;
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{constraint}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SPEEDPAINT_MOST_WANTED.map(p => {
          const isSelected = selected.includes(p.name);
          return (
            <button
              key={p.name}
              onClick={() => onToggle(p.name)}
              title={p.name}
              className={cn(
                'w-7 h-7 rounded-md border-2 transition-all',
                isSelected ? 'border-primary scale-110 ring-1 ring-primary/50' : 'border-transparent hover:border-muted-foreground/40'
              )}
              style={{ backgroundColor: p.hex }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ColourRoleSelector({
  baseOverride,
  midtoneOverrides,
  highlightOverride,
  onBaseChange,
  onMidtoneChange,
  onHighlightChange,
}: ColourRoleSelectorProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colour Role Overrides</h3>

      <PaintPicker
        label="Base"
        constraint="Exactly 1"
        selected={baseOverride ? [baseOverride] : []}
        onToggle={(name) => onBaseChange(baseOverride === name ? null : name)}
      />

      <PaintPicker
        label="Midtones"
        constraint="Up to 2"
        selected={midtoneOverrides}
        onToggle={(name) => {
          if (midtoneOverrides.includes(name)) {
            onMidtoneChange(midtoneOverrides.filter(n => n !== name));
          } else if (midtoneOverrides.length < 2) {
            onMidtoneChange([...midtoneOverrides, name]);
          }
        }}
      />

      <PaintPicker
        label="Highlight"
        constraint="Exactly 1"
        selected={highlightOverride ? [highlightOverride] : []}
        onToggle={(name) => onHighlightChange(highlightOverride === name ? null : name)}
      />

      {(baseOverride || midtoneOverrides.length > 0 || highlightOverride) && (
        <button
          onClick={() => { onBaseChange(null); onMidtoneChange([]); onHighlightChange(null); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all overrides
        </button>
      )}
    </div>
  );
}
