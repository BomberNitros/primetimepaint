import { useState, useEffect } from 'react';
import { UploadedImage } from '@/types/primetime';

interface DualSliderProps {
  originalImage: string | null;
  customRepaintImage: string | null;
  mainImages: UploadedImage[];
  sliderIndex: number;
  onSliderIndexChange: (i: number) => void;
}

export function DualSlider({
  originalImage,
  customRepaintImage,
  mainImages,
  sliderIndex,
  onSliderIndexChange,
}: DualSliderProps) {
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Left — Original */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Original</p>
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
          <p className="text-xs text-muted-foreground mb-1">AI Repaint</p>
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
      </div>

      {/* Navigation */}
      {mainImages.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
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
            onClick={() => onSliderIndexChange(sliderIndex + 1)}
            disabled={sliderIndex === mainImages.length - 1}
            className="px-3 py-1 text-xs rounded-md border border-border disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      {/* Lightbox */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setZoomImage(null)}
        >
          <button
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
