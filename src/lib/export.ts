/**
 * Export utility: composites the RecolorPreview canvas against a
 * fixed neutral background (#808080) before writing the PNG.
 *
 * This ensures exported colours are consistent regardless of the
 * dark workspace UI behind them. The compositing happens in the
 * export path only — the live preview continues to render against
 * the workspace background.
 */

const EXPORT_BG = '#808080';

export async function exportPreviewAsPng(sourceCanvas: HTMLCanvasElement): Promise<string> {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  // Create offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context for export');

  // Fill with neutral mid-grey background
  ctx.fillStyle = EXPORT_BG;
  ctx.fillRect(0, 0, w, h);

  // Draw the preview canvas on top
  ctx.drawImage(sourceCanvas, 0, 0);

  // Return as data URL
  return offscreen.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
