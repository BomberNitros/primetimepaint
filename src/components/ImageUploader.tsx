import { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadedImage } from '@/types/primetime';
import { randomFont } from '@/components/ControlRail';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  mainImages: UploadedImage[];
  referenceImages: UploadedImage[];
  onMainImagesChange: (files: File[]) => void;
  onReferenceImagesChange: (files: File[]) => void;
  repaintStartTime: Date | null;
  onAnalyseAndRepaint: () => void;
  pipelineComplete: boolean;
  pipelineError: string | null;
  currentlyRepainting: boolean;
}

export function ImageUploader({
  mainImages,
  referenceImages,
  onMainImagesChange,
  onReferenceImagesChange,
  repaintStartTime,
  onAnalyseAndRepaint,
  pipelineComplete,
  pipelineError,
  currentlyRepainting,
}: ImageUploaderProps) {
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingRef, setIsDraggingRef] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const [elapsed, setElapsed] = useState(0);

  // Timer for repainting state
  useState(() => {
    if (!currentlyRepainting || !repaintStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - repaintStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleFiles = useCallback((files: FileList | null, isMain: boolean) => {
    if (!files) return;
    const all = Array.from(files);
    const valid = all.filter(f => f.type.startsWith('image/'));
    const invalid = all.length - valid.length;

    if (invalid > 0) {
      toast.error('Upload failed. Please use a valid image file.', { duration: 4000 });
    }
    if (valid.length === 0) return;

    if (isMain) {
      onMainImagesChange(valid);
    } else {
      onReferenceImagesChange(valid);
    }
    toast.success('Image uploaded successfully.', { duration: 3000 });
  }, [onMainImagesChange, onReferenceImagesChange]);

  const mainCount = mainImages.length;
  const refCount = referenceImages.length;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Miniature</h2>
        <p className="text-sm text-muted-foreground">Upload photos of your miniature to begin planning.</p>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        Drop 4 main photos and a reference. Give the AI something to steal from.
      </p>

      {/* Dual dropzones */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
        {/* Main images zone */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-foreground">Main photos</span>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingMain(true); }}
            onDragLeave={() => setIsDraggingMain(false)}
            onDrop={(e) => { e.preventDefault(); setIsDraggingMain(false); handleFiles(e.dataTransfer.files, true); }}
            onClick={() => mainInputRef.current?.click()}
            className={cn(
              'aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
              isDraggingMain ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
            )}
          >
            {mainCount > 0 ? (
              <>
                <CheckCircle className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {mainCount} {mainCount === 1 ? 'photo' : 'photos'}
                </p>
                <p className="text-xs text-muted-foreground">Drop or click to add more</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Drop miniature photos</p>
                <p className="text-xs text-muted-foreground">Click or drag to upload</p>
              </>
            )}
          </div>
          <input ref={mainInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files, true)} className="hidden" />
        </div>

        {/* Reference images zone */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-foreground">Reference images</span>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingRef(true); }}
            onDragLeave={() => setIsDraggingRef(false)}
            onDrop={(e) => { e.preventDefault(); setIsDraggingRef(false); handleFiles(e.dataTransfer.files, false); }}
            onClick={() => refInputRef.current?.click()}
            className={cn(
              'aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
              isDraggingRef ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
            )}
          >
            {refCount > 0 ? (
              <>
                <CheckCircle className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {refCount} {refCount === 1 ? 'reference' : 'references'}
                </p>
                <p className="text-xs text-muted-foreground">Drop or click to add more</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Drop reference images</p>
                <p className="text-xs text-muted-foreground">Optional inspiration references</p>
              </>
            )}
          </div>
          <input ref={refInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files, false)} className="hidden" />
        </div>
      </div>

      {/* Pipeline button */}
      {!pipelineComplete && (
        <>
          <Button
            disabled={mainCount === 0 || currentlyRepainting}
            onClick={onAnalyseAndRepaint}
            className={cn(
              'mt-2 transition-all duration-300 ease-in-out gap-2',
              mainCount > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'
            )}
            size="lg"
          >
            {currentlyRepainting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analysing & repainting…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyse & Repaint
              </>
            )}
          </Button>
          {!currentlyRepainting && mainCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Anatomy analysis · free · Repaint · €0.04
            </p>
          )}
        </>
      )}

      {/* Pipeline complete state */}
      {pipelineComplete && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span>Pipeline complete. Navigate via sidebar.</span>
        </div>
      )}

      {/* Pipeline error */}
      {pipelineError && (
        <p className="text-xs text-destructive">{pipelineError}</p>
      )}
    </div>
  );
}
