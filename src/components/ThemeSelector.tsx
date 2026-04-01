import { ThemeId } from '@/types/primetime';
import { cn } from '@/lib/utils';

const THEMES: { id: ThemeId; label: string; description: string; accent: string }[] = [
  { id: 'grimdark', label: 'Grimdark', description: 'Desaturated, dark, weathered', accent: 'bg-zinc-600' },
  { id: 'vibrant', label: 'Vibrant', description: 'Bold, saturated, eye-catching', accent: 'bg-red-500' },
  { id: 'natural', label: 'Natural', description: 'Earthy, realistic tones', accent: 'bg-amber-700' },
  { id: 'high-contrast', label: 'High Contrast', description: 'Sharp light/dark separation', accent: 'bg-white' },
];

interface ThemeSelectorProps {
  selected: ThemeId | null;
  onSelect: (t: ThemeId) => void;
}

export function ThemeSelector({ selected, onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={cn(
            'p-3 rounded-lg border text-left transition-colors',
            selected === t.id
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-muted-foreground/30'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('w-3 h-3 rounded-full', t.accent)} />
            <span className="text-sm font-medium text-foreground">{t.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.description}</p>
        </button>
      ))}
    </div>
  );
}
