import { useEffect, useRef } from 'react';
import { StepId, RepaintEntry } from '@/types/primetime';
import { Upload, Sun, Palette, Paintbrush, Droplets, ClipboardList, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepaintTimer } from '@/components/RepaintTimer';
import { RepaintTicker } from '@/components/RepaintTicker';

interface Step {
  id: StepId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { id: 'upload', label: 'Miniature', icon: Upload },
  { id: 'priming', label: 'Priming', icon: Sun },
  { id: 'color-plan', label: 'Coloring', icon: Palette },
  { id: 'brush-guide', label: 'Brush Guide', icon: Paintbrush },
  { id: 'paint-handling', label: 'Handling', icon: Droplets },
  { id: 'thinning-plan', label: 'Application & Thinning', icon: ClipboardList },
  { id: 'finish', label: 'Varnish', icon: Shield },
];

// ---- Font pool (18 fonts) ----
const TITLE_FONTS = [
  'Satoshi', 'Cabinet Grotesk', 'Clash Display', 'General Sans', 'Chillax',
  'Zodiak', 'Boska', 'Switzer', 'Ranade', 'Playfair Display',
  'DM Serif Display', 'Oswald', 'Raleway', 'Cinzel', 'Fjalla One',
  'Libre Baskerville', 'Cormorant Garamond', 'Marcellus',
];

// Pick once at module load — stable across renders, exported for column labels
export const randomFont = TITLE_FONTS[Math.floor(Math.random() * TITLE_FONTS.length)];

interface ControlRailProps {
  activeStep: StepId;
  onStepChange: (step: StepId) => void;
  hasImages: boolean;
  pipelineComplete: boolean;
  currentlyRepainting: boolean;
  backgroundRepainting: boolean;
  repaintStartTime: Date | null;
  repaintLog: RepaintEntry[];
}

export function ControlRail({
  activeStep,
  onStepChange,
  hasImages,
  pipelineComplete,
  currentlyRepainting,
  backgroundRepainting,
  repaintStartTime,
  repaintLog,
}: ControlRailProps) {
  return (
    <nav className="w-[168px] min-w-[168px] bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Brand */}
      <div className="px-3 py-4 border-b border-sidebar-border flex flex-col items-start">
        <PaintBottleLogo />
        <PrimetimeTitle />
        <p className="text-muted-foreground mt-0.5 tracking-wide text-xs">Scheme first. Paint later.</p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto py-1">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          // Upload step uses hasImages gate; other steps use pipelineComplete gate
          const isDisabled = step.id === 'upload'
            ? false
            : !pipelineComplete;
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
                isDisabled && 'opacity-40 pointer-events-none cursor-default'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', isActive ? 'text-primary' : '')} />
              <span className="leading-tight">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom: Timer + Ticker */}
      <div className="mt-auto">
        <div className="border-t border-border">
          <RepaintTimer
            currentlyRepainting={currentlyRepainting}
            repaintStartTime={repaintStartTime}
          />
          <RepaintTicker repaintLog={repaintLog} />
        </div>
      </div>
    </nav>
  );
}

// ---- Animated Paint Bottle Logo ----
function PaintBottleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 130"
      height="52"
      fill="currentColor"
      aria-label="Primetime logo"
      className="text-foreground mb-2 primetime-bottle"
      style={{ width: 'auto' }}
    >
      <defs>
        <clipPath id="bottleClip">
          <rect x="10" y="52" width="60" height="66" rx="10" />
        </clipPath>
      </defs>

      <g className="primetime-bottle-group">
        <rect x="10" y="52" width="60" height="66" rx="10" fill="currentColor" />
        <rect x="28" y="38" width="24" height="18" fill="currentColor" />
        <rect className="primetime-cap" x="22" y="14" width="36" height="28" rx="6" fill="currentColor" />
        <circle cx="40" cy="10" r="4" fill="hsl(var(--sidebar-background))" />
        <text
          x="40" y="84"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="32"
          fontWeight="700"
          fontFamily="inherit"
          fill="hsl(var(--sidebar-background))"
        >
          P
        </text>

        <rect
          className="primetime-fill"
          x="10" y="52" width="60" height="66"
          fill="hsl(var(--primary))"
          opacity="0.4"
          clipPath="url(#bottleClip)"
        />

        <g className="primetime-wave-riser">
          <g className="primetime-wave-oscillator">
            <path
              d="M-20,0 C0,-8 20,8 40,-8 C60,8 80,-8 100,0 L100,12 C80,20 60,4 40,12 C20,4 0,20 -20,12 Z"
              fill="hsl(var(--primary))"
              opacity="0.55"
              clipPath="url(#bottleClip)"
              transform="translate(0,52)"
            />
          </g>
        </g>

        <ellipse
          className="primetime-inkdrop"
          cx="40" cy="10" rx="4" ry="6"
          fill="hsl(var(--primary))"
          opacity="0"
        />
      </g>
    </svg>
  );
}

// ---- Primetime Title with random font + auto-shrink ----
function PrimetimeTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    function fitTitle() {
      const el = titleRef.current;
      if (!el) return;
      const parent = el.parentElement;
      if (!parent) return;
      const style = getComputedStyle(parent);
      const available = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      let size = 56;
      el.style.fontSize = `${size}px`;
      while (el.scrollWidth > available && size > 16) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    }
    fitTitle();
    window.addEventListener('resize', fitTitle);
    return () => window.removeEventListener('resize', fitTitle);
  }, []);

  return (
    <h1
      ref={titleRef}
      className="leading-none font-bold tracking-tight text-foreground"
      style={{
        fontFamily: `'${randomFont}', sans-serif`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        maxWidth: '100%',
        textOverflow: 'clip',
      }}
    >
      Primetime
    </h1>
  );
}
