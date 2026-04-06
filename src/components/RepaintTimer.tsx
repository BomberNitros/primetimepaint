import { useState, useEffect, useRef } from 'react';
import { Loader2, Check } from 'lucide-react';

interface RepaintTimerProps {
  currentlyRepainting: boolean;
  backgroundRepainting: boolean;
  repaintStartTime: Date | null;
}

type Status = 'idle' | 'active' | 'complete';

export function RepaintTimer({ currentlyRepainting, repaintStartTime }: RepaintTimerProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (currentlyRepainting && repaintStartTime) {
      setStatus('active');
      setElapsed(0);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - repaintStartTime.getTime()) / 1000));
      }, 1000);
    } else if (!currentlyRepainting && status === 'active') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      setFinalTime(`${m}:${String(s).padStart(2, '0')}`);
      setStatus('complete');
      hideTimeoutRef.current = setTimeout(() => setStatus('idle'), 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentlyRepainting]);

  if (status === 'idle') return null;

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const timeStr = `${m}:${String(s).padStart(2, '0')}`;

  const transitionStyle = prefersReducedMotion
    ? {}
    : {
        transition: 'transform 200ms ease-out',
        transform: 'translateY(0)',
      };

  return (
    <div
      className="w-full rounded-t-md bg-card px-4 py-3 flex items-center gap-2 border-l-2 border-primary"
      style={transitionStyle}
    >
      {status === 'active' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
            Repainting · {timeStr}
          </span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
            Complete · {finalTime}
          </span>
        </>
      )}
    </div>
  );
}
