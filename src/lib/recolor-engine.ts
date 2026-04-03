/**
 * Extracted recolor engine — runs the heuristic miniature isolation +
 * tonal-zone recoloring pipeline on an image and returns a data URL.
 *
 * Used by both RecolorPreview (single canvas) and useRecolorMap (batch).
 */

import { ZenithalDirection } from '@/types/primetime';

const ZENITHAL_INTENSITY = 30;
const LIGHT_ANGLES: Record<ZenithalDirection, number> = {
  'top': Math.PI / 2,
  'top-left': (3 * Math.PI) / 4,
  'top-right': Math.PI / 4,
};

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function detectBackgroundColor(imageData: ImageData): [number, number, number, number] {
  const { data, width, height } = imageData;
  const samples: [number, number, number][] = [];
  const positions = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
  ];
  for (const [x, y] of positions) {
    const idx = (y * width + x) * 4;
    samples.push([data[idx], data[idx + 1], data[idx + 2]]);
  }
  const avg: [number, number, number] = [
    Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length),
    Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length),
    Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length),
  ];
  return [...avg, 45];
}

function isBackground(r: number, g: number, b: number, bg: [number, number, number, number]): boolean {
  return Math.abs(r - bg[0]) < bg[3] && Math.abs(g - bg[1]) < bg[3] && Math.abs(b - bg[2]) < bg[3];
}

function blendOverlay(base: number, overlay: number): number {
  const b = base / 255;
  const o = overlay / 255;
  const result = b < 0.5 ? 2 * b * o : 1 - 2 * (1 - b) * (1 - o);
  return Math.round(result * 255);
}

export interface RecolorParams {
  baseColor: string | null;
  midtone1Color: string | null;
  midtone2Color: string | null;
  highlightColor: string | null;
  zenithalEnabled: boolean;
  zenithalDirection: ZenithalDirection;
}

/**
 * Recolors an image and returns a data URL.
 * Returns null if no colours are assigned or image fails to load.
 */
export function recolorImage(imageUrl: string, params: RecolorParams): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxDim = 600;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.drawImage(img, 0, 0, w, h);

      if (!params.baseColor && !params.midtone1Color && !params.highlightColor) {
        resolve(null);
        return;
      }

      const imageData = ctx.getImageData(0, 0, w, h);
      const { data } = imageData;
      const bgColor = detectBackgroundColor(imageData);

      const basePx = params.baseColor ? hexToRgb(params.baseColor) : null;
      const mid1Px = params.midtone1Color ? hexToRgb(params.midtone1Color) : null;
      const mid2Px = params.midtone2Color ? hexToRgb(params.midtone2Color) : mid1Px;
      const highPx = params.highlightColor ? hexToRgb(params.highlightColor) : null;

      const centerX = w / 2, centerY = h / 2;
      const lightAngle = LIGHT_ANGLES[params.zenithalDirection];
      const opacity = 0.65;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          if (isBackground(r, g, b, bgColor)) continue;

          let lum = getLuminance(r, g, b);
          if (params.zenithalEnabled) {
            const dx = x - centerX, dy = centerY - y;
            const pixelAngle = Math.atan2(dy, dx);
            lum = Math.max(0, Math.min(255, lum + ZENITHAL_INTENSITY * Math.cos(pixelAngle - lightAngle)));
          }

          let zoneColor: [number, number, number] | null = null;
          if (lum <= 85 && basePx) zoneColor = basePx;
          else if (lum <= 128 && mid1Px) zoneColor = mid1Px;
          else if (lum <= 170 && mid2Px) zoneColor = mid2Px;
          else if (highPx) zoneColor = highPx;

          if (zoneColor) {
            const grey = lum / 255;
            const structV = Math.round(grey * 255);
            data[idx] = Math.round(r * (1 - opacity) + blendOverlay(structV, zoneColor[0]) * opacity);
            data[idx + 1] = Math.round(g * (1 - opacity) + blendOverlay(structV, zoneColor[1]) * opacity);
            data[idx + 2] = Math.round(b * (1 - opacity) + blendOverlay(structV, zoneColor[2]) * opacity);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}
