import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UploadedImage } from '@/types/primetime';
import { cn } from '@/lib/utils';

interface ImageSliderProps {
  images: UploadedImage[];
  recolorMap: Record<string, string | null>;
}

export function ImageSlider({ images, recolorMap }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  const total = images.length;
  const prev = useCallback(() => setCurrent(i => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(i => (i + 1) % total), [total]);

  if (total === 0) return null;

  const img = images[current];
  const recolored = recolorMap[img.id] ?? null;
  const src = recolored || img.objectUrl;
  const isRecolored = !!recolored;

  return (
    <div className="space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-card"
        style={{ height: 340 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={src}
          alt={`Image ${current + 1}`}
          className="w-full h-full object-cover object-center transition-opacity duration-400"
        />

        {/* Arrows — only visible on hover, hidden if 1 image */}
        {total > 1 && hovered && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom-left badge: MAIN or REF */}
        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-medium uppercase tracking-wide">
          {img.type === 'main' ? 'Main' : 'Ref'}
        </span>

        {/* Bottom-right badge: Recolored or Original */}
        <span
          className={cn(
            'absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-medium',
            isRecolored
              ? 'bg-primary/80 text-primary-foreground'
              : 'bg-black/40 text-muted-foreground'
          )}
        >
          {isRecolored ? 'Recolored' : 'Original'}
        </span>
      </div>

      {/* Dot indicators — hidden if 1 image */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i === current ? 'bg-accent' : 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 italic">
        Planning preview — not a paint simulation
      </p>
    </div>
  );
}
