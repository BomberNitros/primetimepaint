import { StepId } from '@/types/primetime';
import { Upload, Sun, Palette, Paintbrush, Droplets, ClipboardList, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: StepId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { id: 'upload', label: 'Miniature', icon: Upload },
  { id: 'priming', label: 'Priming', icon: Sun },
  { id: 'color-plan', label: 'Colour Plan', icon: Palette },
  { id: 'brush-guide', label: 'Brush Guide', icon: Paintbrush },
  { id: 'paint-handling', label: 'Handling', icon: Droplets },
  { id: 'thinning-plan', label: 'Thinning & Application', icon: ClipboardList },
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
      <div className="px-3 py-4 border-b border-sidebar-border flex flex-col items-center">
        {/* Logo SVG */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-foreground mb-2"
        >
          {/* Brush handle */}
          <rect x="29" y="2" width="6" height="28" rx="2" fill="currentColor" opacity="0.7" />
          {/* Ferrule */}
          <rect x="28" y="28" width="8" height="5" rx="1" fill="currentColor" opacity="0.9" />
          {/* Bristle tip */}
          <path d="M28 33 L32 40 L36 33 Z" fill="currentColor" />
          {/* Shield drop */}
          <path
            d="M32 42 C32 42 22 47 22 54 C22 59 26.5 62 32 62 C37.5 62 42 59 42 54 C42 47 32 42 32 42Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Miniature silhouette inside shield */}
          <path
            d="M30 54 L30 50 L29 50 L32 47 L35 50 L34 50 L34 54 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
        <PrimetimeTitle />
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

// ---- Primetime Title with random font on page load ----

const TITLE_FONTS = [
  'Bebas Neue',
  'Cinzel',
  'Abril Fatface',
  'Playfair Display',
  'Pirata One',
  'Uncial Antiqua',
  'Permanent Marker',
  'Josefin Sans',
];

// Pick once at module load time — stable across renders
const randomFont = TITLE_FONTS[Math.floor(Math.random() * TITLE_FONTS.length)];

function PrimetimeTitle() {
  return (
    <h1
      className="text-[2.5rem] leading-none font-bold tracking-tight text-foreground"
      style={{ fontFamily: `'${randomFont}', cursive` }}
    >
      Primetime
    </h1>
  );
}
