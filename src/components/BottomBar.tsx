import { UploadedImage } from '@/types/primetime';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomBarProps {
  images: UploadedImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  selectedTheme: string | null;
}

export function BottomBar({ images, selectedIndex, onSelect, onRemove, selectedTheme }: BottomBarProps) {
  if (images.length === 0) return null;

  return (
    <div className="h-20 min-h-[80px] border-t border-border bg-surface flex items-center gap-3 px-4 overflow-x-auto">
      {images.map((img, i) => (
        <div key={img.id} className="relative group flex-shrink-0">
          <button
            onClick={() => onSelect(i)}
            className={cn(
              'w-14 h-14 rounded-md overflow-hidden border-2 transition-colors',
              i === selectedIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
            )}
          >
            <img src={img.objectUrl} alt="" className="w-full h-full object-cover" />
          </button>
          <button
            onClick={() => onRemove(img.id)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
          <span className={cn(
            'absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-medium px-1 rounded',
            img.type === 'reference' ? 'bg-warning/80 text-warning-foreground' : 'bg-primary/80 text-primary-foreground'
          )}>
            {img.type === 'reference' ? 'REF' : 'MAIN'}
          </span>
        </div>
      ))}

      {selectedTheme && (
        <div className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-md bg-secondary text-xs text-muted-foreground capitalize">
          {selectedTheme}
        </div>
      )}
    </div>
  );
}
