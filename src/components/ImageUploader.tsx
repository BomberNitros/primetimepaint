import { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageType } from '@/types/primetime';
import { randomFont } from '@/components/ControlRail';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onUpload: (files: File[], type: ImageType) => void;
  mainCount: number;
  refCount: number;
  onAnalyseAndRepaint: () => void;
  pipelineComplete: boolean;
  pipelineError: string | null;
  currentlyRepainting: boolean;
  initialRepaintImage: string | null;
}

export function ImageUploader({
  onUpload,
  mainCount,
  refCount,
  onAnalyseAndRepaint,
  pipelineComplete,
  pipelineError,
  currentlyRepainting,
  initialRepaintImage,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadType, setUploadType] = useState<ImageType>('main');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const all = Array.from(files);
    const valid = all.filter(f => f.type.startsWith('image/'));
    const invalid = all.length - valid.length;

    if (invalid > 0) {
      toast.error('Upload failed. Please use a valid image file.', { duration: 4000 });
    }
    if (valid.length === 0) return;

    onUpload(valid, uploadType);
    toast.success('Image uploaded successfully.', { duration: 3000 });
  }, [onUpload, uploadType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const hasImages = mainCount > 0 || refCount > 0;

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Miniature</h2>
        <p className="text-sm text-muted-foreground">Upload photos of your miniature to begin planning.</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setUploadType('main')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            uploadType === 'main' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          Main Photos
        </button>
        <button
          onClick={() => setUploadType('reference')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            uploadType === 'reference' ? 'bg-warning text-warning-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          Reference Photos
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Recommended: 4 main photos and up to 2 reference images for best results.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'w-full max-w-lg aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
        )}
      >
        {hasImages ? (
          <>
            <CheckCircle className="w-10 h-10 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {mainCount} main {mainCount === 1 ? 'photo' : 'photos'}{refCount > 0 ? `, ${refCount} reference` : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drop or click to add more
              </p>
            </div>
          </>
        ) : (
          <>
            {uploadType === 'main' ? (
              <Upload className="w-10 h-10 text-muted-foreground" />
            ) : (
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop {uploadType === 'main' ? 'miniature photos' : 'reference images'} here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {uploadType === 'main'
                  ? 'Click or drag to upload'
                  : 'Optional inspiration references'
                }
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

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

      {/* Initial repaint image */}
      {initialRepaintImage && (
        <div className="w-full max-w-lg mt-4">
          <p className="text-xs text-muted-foreground mb-1">Initial repaint</p>
          <p className="text-xs text-muted-foreground/60 mb-2">Priming section now unlocked.</p>
          <img
            src={initialRepaintImage}
            alt="Initial repaint"
            className="w-full rounded-md"
          />
        </div>
      )}
    </div>
  );
}
