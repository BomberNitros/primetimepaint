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
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 60 160"
          height="56"
          fill="currentColor"
          aria-label="Primetime logo"
          className="text-foreground mb-2 self-start"
          style={{ width: 'auto' }}
        >
          <path d="M30 4 C30 4 18 26 18 38 C18 50 23 58 30 58 C37 58 42 50 42 38 C42 26 30 4 30 4Z"/>
          <rect x="27" y="58" width="6" height="8"/>
          <path d="M27 66 C27 66 16 68 14 74 C12 80 18 84 22 82 C24 81 26 78 27 74 L27 66Z"/>
          <path d="M33 66 C33 66 44 68 46 74 C48 80 42 84 38 82 C36 81 34 78 33 74 L33 66Z"/>
          <rect x="27" y="72" width="6" height="6" transform="rotate(45 30 75)"/>
          <rect x="27.5" y="82" width="5" height="56"/>
          <path d="M27.5 138 L32.5 138 L31 154 L29 154 Z"/>
          <rect x="28" y="154" width="4" height="4" rx="1"/>
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
