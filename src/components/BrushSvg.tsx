import { BrushType } from '@/types/primetime';

interface BrushSvgProps {
  type: BrushType;
  size?: number;
  className?: string;
}

function RoundBrush() {
  return (
    <g>
      <rect x="11" y="2" width="2" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M9 16 C9 16, 10 22, 12 22 C14 22, 15 16, 15 16" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="9" y="14" width="6" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="hsl(var(--muted))" />
    </g>
  );
}

function FlatBrush() {
  return (
    <g>
      <rect x="10" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="7" y="16" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="7" y="14" width="10" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="hsl(var(--muted))" />
    </g>
  );
}

function FilbertBrush() {
  return (
    <g>
      <rect x="10" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7 18 C7 16, 10 14, 12 14 C14 14, 17 16, 17 18 L17 22 L7 22 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="7" y="14" width="10" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="hsl(var(--muted))" />
    </g>
  );
}

function LinerBrush() {
  return (
    <g>
      <rect x="11" y="2" width="2" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M11 14 L12 23 L13 14" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="10" y="13" width="4" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="hsl(var(--muted))" />
    </g>
  );
}

function AngleBrush() {
  return (
    <g>
      <rect x="10" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <path d="M7 14 L7 20 L17 22 L17 14 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="7" y="13" width="10" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="hsl(var(--muted))" />
    </g>
  );
}

function SpotBrush() {
  return (
    <g>
      <rect x="11" y="2" width="2" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="20" r="3" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="9" y="14" width="6" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="hsl(var(--muted))" />
    </g>
  );
}

const BRUSH_MAP: Record<BrushType, React.FC> = {
  round: RoundBrush,
  flat: FlatBrush,
  filbert: FilbertBrush,
  liner: LinerBrush,
  angle: AngleBrush,
  spot: SpotBrush,
};

export function BrushSvg({ type, size = 24, className }: BrushSvgProps) {
  const Component = BRUSH_MAP[type];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <Component />
    </svg>
  );
}
