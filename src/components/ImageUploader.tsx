import { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageType } from '@/types/primetime';

interface ImageUploaderProps {
  onUpload: (files: File[], type: ImageType) => void;
  mainCount: number;
  maxMain?: number;
}

export function ImageUploader({ onUpload, mainCount, maxMain = 6 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadType, setUploadType] = useState<ImageType>('main');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) return;
    onUpload(valid, uploadType);
  }, [onUpload, uploadType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const remainingMain = maxMain - mainCount;

  return (
    <div className="flex flex-col items-center gap-6 p-8">
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
              ? `${remainingMain > 0 ? `Up to ${remainingMain} more` : 'Maximum reached'} (4–6 recommended)`
              : 'Optional inspiration references'
            }
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
