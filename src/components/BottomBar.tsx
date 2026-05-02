import { UploadedImage, RepaintHistoryEntry, ColorScheme } from '@/types/primetime';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import JSZip from 'jszip';

interface BottomBarProps {
  images: UploadedImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (id: string) => void;
  selectedTheme: string | null;
  repaintHistory: RepaintHistoryEntry[];
  activeScheme: ColorScheme | null;
}

export function BottomBar({ images, selectedIndex, onSelect, onRemove, selectedTheme, repaintHistory, activeScheme }: BottomBarProps) {
  if (images.length === 0) return null;

  const mainImages = images.filter(i => i.type === 'main');

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const composeWithPaletteStrip = async (dataUrl: string): Promise<string> => {
    if (!activeScheme) return dataUrl;
    const paints = [
      activeScheme.base,
      activeScheme.midtone1,
      ...(activeScheme.midtone2 ? [activeScheme.midtone2] : []),
      activeScheme.highlight,
    ];
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = dataUrl;
    });
    const w = img.width;
    const h = img.height;
    const stripH = 64;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h + stripH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, h, w, stripH);
    const n = paints.length;
    const gutter = 8;
    const swatchWidth = (w - gutter * (n + 1)) / n;
    const swatchSize = 20;
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'top';
    for (let i = 0; i < n; i++) {
      const x = gutter + i * (swatchWidth + gutter);
      const y = h + 8;
      ctx.fillStyle = paints[i].hex;
      ctx.fillRect(x, y, swatchSize, swatchSize);
      let name = paints[i].name;
      if (ctx.measureText(name).width > swatchWidth) {
        while (name.length > 0 && ctx.measureText(name + '…').width > swatchWidth) {
          name = name.slice(0, -1);
        }
        name = name + '…';
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, x, h + 8 + swatchSize + 6);
    }
    return canvas.toDataURL('image/png');
  };

  const handleDownloadAll = async () => {
    if (repaintHistory.length === 0) return;
    if (repaintHistory.length === 1) {
      const composed = await composeWithPaletteStrip(repaintHistory[0].image);
      downloadDataUrl(composed, 'repaint-1.png');
      return;
    }
    const zip = new JSZip();
    for (let i = 0; i < repaintHistory.length; i++) {
      const dataUrl = await composeWithPaletteStrip(repaintHistory[i].image);
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      zip.file(`repaint-${i + 1}.png`, base64, { base64: true });
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repaints.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

      {repaintHistory.map((entry, i) => (
        <button
          key={i}
          onClick={async () => {
            const composed = await composeWithPaletteStrip(entry.image);
            downloadDataUrl(composed, `repaint-${i + 1}.png`);
          }}
          className="w-14 h-14 rounded-md overflow-hidden border-2 border-transparent hover:border-muted-foreground/30 flex-shrink-0"
        >
          <img src={entry.image} alt="" className="w-full h-full object-cover" />
        </button>
      ))}

      {selectedTheme && (
        <div className="flex-shrink-0 px-3 py-1.5 rounded-md bg-secondary text-xs text-muted-foreground capitalize">
          {selectedTheme}
        </div>
      )}

      {repaintHistory.length > 0 && (
        <button
          onClick={handleDownloadAll}
          className="ml-auto flex-shrink-0 bg-secondary text-xs text-muted-foreground rounded-md px-3 py-1.5 hover:text-foreground transition-colors"
        >
          Download Repaints
        </button>
      )}
    </div>
  );
}
