import { StepId } from '@/types/primetime';
import { Upload, Sun, Palette, Paintbrush, Droplets, ClipboardList, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: StepId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'priming', label: 'Priming & Zenithal', icon: Sun },
  { id: 'color-plan', label: 'Colour Plan', icon: Palette },
  { id: 'brush-guide', label: 'Brush Guide', icon: Paintbrush },
  { id: 'paint-handling', label: 'Paint Handling', icon: Droplets },
  { id: 'thinning-plan', label: 'Thinning Plan', icon: ClipboardList },
  { id: 'finish', label: 'Finish & Varnish', icon: Shield },
];

interface ControlRailProps {
  activeStep: StepId;
  onStepChange: (step: StepId) => void;
  hasImages: boolean;
}

export function ControlRail({ activeStep, onStepChange, hasImages }: ControlRailProps) {
  return (
    <nav className="w-[168px] min-w-[168px] bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Brand */}
      <div className="px-3 py-4 border-b border-sidebar-border">
        <h1 className="text-base font-bold tracking-tight text-foreground">Primetime</h1>
        <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">Scheme First. Paint Later.</p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto py-1">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isDisabled = step.id !== 'upload' && !hasImages;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => !isDisabled && onStepChange(step.id)}
              disabled={isDisabled}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium transition-colors text-left',
                isActive && 'bg-sidebar-accent text-sidebar-primary border-r-2 border-primary',
                !isActive && !isDisabled && 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                isDisabled && 'text-muted-foreground/40 cursor-not-allowed'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', isActive ? 'text-primary' : '')} />
              <span className="leading-tight">{step.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
