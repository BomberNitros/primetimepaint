import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SliderImage {
  id: string;
  src: string;
  badgeLeft: string;
  badgeRight: string;
  badgeRightAccent: boolean;
}

interface ImageSliderProps {
  slides: SliderImage[];
}

function Lightbox({
  slides,
  current,
  onClose,
  onPrev,
  onNext,
}: {
  slides: SliderImage[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  const slide = slides[current];
  const total = slides.length;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={current === 0}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white transition-colors z-10',
              current === 0 ? 'opacity-30 pointer-events-none' : 'hover:bg-black/70'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={current === total - 1}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white transition-colors z-10',
              current === total - 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-black/70'
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <img
        src={slide.src}
        alt={`Slide ${current + 1}`}
        className="object-contain"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}

export function ImageSlider({ slides }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = slides.length;
  const prev = useCallback(() => setCurrent(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setCurrent(i => Math.min(total - 1, i + 1)), [total]);

  if (total === 0) return null;

  const slide = slides[current];

  return (
    <div className="space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-card cursor-pointer"
        style={{ height: 340 }}
      >
        <img
          src={slide.src}
          alt={`Slide ${current + 1}`}
          className="w-full h-full object-cover object-center"
          onClick={() => setLightboxOpen(true)}
        />

        {/* Always-visible arrows */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className={cn(
                'absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white transition-colors',
                current === 0 ? 'opacity-30 pointer-events-none' : 'hover:bg-black/70'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              disabled={current === total - 1}
              className={cn(
                'absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white transition-colors',
                current === total - 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-black/70'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom-left badge */}
        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-medium uppercase tracking-wide">
          {slide.badgeLeft}
        </span>

        {/* Bottom-right badge */}
        <span
          className={cn(
            'absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-medium',
            slide.badgeRightAccent
              ? 'bg-primary/80 text-primary-foreground'
              : 'bg-black/40 text-muted-foreground'
          )}
        >
          {slide.badgeRight}
        </span>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={cn(
                'flex-shrink-0 rounded-md overflow-hidden transition-all',
                i === current
                  ? 'ring-2 ring-accent opacity-100'
                  : 'opacity-50 hover:opacity-75'
              )}
              style={{ width: 64, height: 48 }}
            >
              <img
                src={s.src}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 italic">
        Planning preview — not a paint simulation
      </p>

      {lightboxOpen && (
        <Lightbox
          slides={slides}
          current={current}
          onClose={() => setLightboxOpen(false)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}
