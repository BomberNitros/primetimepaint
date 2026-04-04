import { useState, useEffect } from 'react';
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
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const downloadable = [
    originalImage
      ? { label: leftLabel ?? 'Original', src: originalImage }
      : null,
    customRepaintImage
      ? { label: rightLabel ?? 'AI Repaint', src: customRepaintImage }
      : null,
  ].filter(Boolean) as { label: string; src: string }[];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Left — Original */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground">
              {leftLabel ?? 'Original'}
            </p>
            {originalImage && (
              <button
                type="button"
                onClick={() => setZoomImage(originalImage)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Zoom
              </button>
            )}
          </div>
          <div
            className="relative rounded-md overflow-hidden border border-border bg-muted/20"
            style={{ maxHeight: '350px' }}
          >
            {originalImage ? (
              <img
                src={originalImage}
                alt="Original"
                className="w-full object-contain cursor-zoom-in"
                style={{ maxHeight: '350px' }}
                onClick={() => setZoomImage(originalImage)}
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Right — AI Repaint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-muted-foreground">
              {rightLabel ?? 'AI Repaint'}
            </p>
            {customRepaintImage && (
              <button
                type="button"
                onClick={() => setZoomImage(customRepaintImage)}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Zoom
              </button>
            )}
          </div>
          <div
            className="relative rounded-md overflow-hidden border border-border bg-muted/20"
            style={{ maxHeight: '350px' }}
          >
            {customRepaintImage ? (
              <img
                src={customRepaintImage}
                alt="AI Repaint"
                className="w-full object-contain cursor-zoom-in"
                style={{ maxHeight: '350px' }}
                onClick={() => setZoomImage(customRepaintImage)}
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-muted-foreground">
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
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-xl font-bold z-10"
            onClick={() => setZoomImage(null)}
          >
            ✕
          </button>
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-md"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
