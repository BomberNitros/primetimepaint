import { useRef } from 'react';
import { Download } from 'lucide-react';
import { exportPreviewAsPng, downloadDataUrl } from '@/lib/export';

interface DownloadBarProps {
  previewCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export function DownloadBar({ previewCanvasRef }: DownloadBarProps) {
  const handleExport = async () => {
    if (!previewCanvasRef.current) return;
    try {
      const dataUrl = await exportPreviewAsPng(previewCanvasRef.current);
      downloadDataUrl(dataUrl, `primetime-preview-${Date.now()}.png`);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      <Download className="w-4 h-4" />
      Export PNG
    </button>
  );
}
