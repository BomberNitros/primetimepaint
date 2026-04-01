import { cn } from '@/lib/utils';

interface ToggleOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 p-3 rounded-lg bg-card hover:bg-card/80 transition-colors"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className={cn(
        'w-10 h-6 rounded-full relative transition-colors flex-shrink-0',
        checked ? 'bg-primary' : 'bg-muted'
      )}>
        <div className={cn(
          'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )} />
      </div>
    </button>
  );
}
