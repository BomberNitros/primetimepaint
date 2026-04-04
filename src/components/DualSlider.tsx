import { useState, useEffect, useCallback } from 'react';
import { UploadedImage } from '@/types/primetime';

interface DualSliderProps {
  originalImage: string | null;
  customRepaintImage: string | null;
  mainImages: UploadedImage[];
  sliderIndex: number;
  onSliderIndexChange: (i: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  allImages?: { label: string; src: string }[];
}

export function DualSlider({
  originalImage,
  customRepaintImage,
  mainImages,
  sliderIndex,
  onSliderIndexChange,
  leftLabel,
  rightLabel,
}: DualSliderProps) {
  const [zoomImage, setZoomImage] = useState<{ src: string; label: string } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomImage(null);
        setZoomScale(1);
        setZoomOffset({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Imperative wheel zoom
  useEffect(() => {
    if (!zoomImage) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoomScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.002)));
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [zoomImage]);

  // Drag to pan
  useEffect(() => {
    if (!zoomImage || !isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setZoomOffset(prev => ({
        x: prev.x + e.clientX - dragStart.x,
        y: prev.y + e.clientY - dragStart.y,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [zoomImage, isDragging, dragStart]);

  const openZoom = useCallback((src: string, label: string) => {
    setZoomImage({ src, label });
    setZoomScale(1);
    setZoomOffset({ x: 0, y: 0 });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setZoomOffset({ x: 0, y: 0 });
  }, []);

  const leftLbl = leftLabel ?? 'Original';
  const rightLbl = rightLabel ?? 'AI Repaint';

  const downloadable = [
    originalImage ? { label: leftLbl, src: originalImage } : null,
    customRepaintImage ? { label: rightLbl, src: customRepaintImage } : null,
  ].filter(Boolean) as { label: string; src: string }[];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'stretch' }} className="w-full">
        {/* Left */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground">{leftLbl}</p>
            {originalImage && (
              <button
                type="button"
                onClick={() => openZoom(originalImage, leftLbl)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Zoom
              </button>
            )}
          </div>
          <div className="relative rounded-md overflow-hidden border border-border bg-muted/20" style={{ height: '320px' }}>
            {originalImage ? (
              <img
                src={originalImage}
                alt={leftLbl}
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => openZoom(originalImage, leftLbl)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground">{rightLbl}</p>
            {customRepaintImage && (
              <button
                type="button"
                onClick={() => openZoom(customRepaintImage, rightLbl)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Zoom
              </button>
            )}
          </div>
          <div className="relative rounded-md overflow-hidden border border-border bg-muted/20" style={{ height: '320px' }}>
            {customRepaintImage ? (
              <img
                src={customRepaintImage}
                alt={rightLbl}
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => openZoom(customRepaintImage, rightLbl)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                Repaint will appear here
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {mainImages.length > 1 && (
          <div className="col-span-2 flex items-center justify-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => onSliderIndexChange(sliderIndex - 1)}
              disabled={sliderIndex === 0}
              className="px-3 py-1 text-xs rounded-md border border-border disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs text-muted-foreground">
              {sliderIndex + 1} / {mainImages.length}
            </span>
            <button
              type="button"
              onClick={() => onSliderIndexChange(sliderIndex + 1)}
              disabled={sliderIndex === mainImages.length - 1}
              className="px-3 py-1 text-xs rounded-md border border-border disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}

        {/* Batch download */}
        {downloadable.length > 0 && (
          <div className="col-span-2 flex justify-end mt-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted/40 transition-colors"
              onClick={() => {
                downloadable.forEach(item => {
                  const a = document.createElement('a');
                  a.href = item.src;
                  a.download = item.label + '.png';
                  a.click();
                });
              }}
            >
              ↓ Download all
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => {
            setZoomImage(null);
            setZoomScale(1);
            setZoomOffset({ x: 0, y: 0 });
          }}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-xl font-bold z-10"
            onClick={() => {
              setZoomImage(null);
              setZoomScale(1);
              setZoomOffset({ x: 0, y: 0 });
            }}
          >
            ✕
          </button>

          {/* Zoom percentage + reset */}
          <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
            <span className="text-white/70 text-sm font-mono">
              {Math.round(zoomScale * 100)}%
            </span>
            {zoomScale !== 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                className="text-white/70 text-xs hover:text-white underline"
              >
                Reset zoom
              </button>
            )}
          </div>

          {/* Hint */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs z-10">
            Scroll to zoom · drag to pan · Esc to close
          </p>

          <img
            src={zoomImage.src}
            alt={zoomImage.label}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-md select-none"
            style={{
              transform: `scale(${zoomScale}) translate(${zoomOffset.x / zoomScale}px, ${zoomOffset.y / zoomScale}px)`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            draggable={false}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => {
              e.stopPropagation();
              setIsDragging(true);
              setDragStart({ x: e.clientX, y: e.clientY });
            }}
          />
        </div>
      )}
    </>
  );
}
