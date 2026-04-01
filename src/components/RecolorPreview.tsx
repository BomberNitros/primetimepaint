import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ZenithalDirection, RenderStrategy } from '@/types/primetime';

/**
 * Heuristic miniature isolation + tonal-zone recoloring engine.
 *
 * Pipeline:
 * 1. Load image onto offscreen canvas
 * 2. Heuristic background isolation (edge contrast + color uniformity)
 * 3. Greyscale structure layer preserving original luminance
 * 4. Apply zenithal directional bias (frozen formula)
 * 5. Classify into 4 tonal zones: dark/mid-low/mid-high/light
 * 6. Map colour-role colours onto zones
 * 7. Composite via multiply/overlay blend at 60-75% opacity
 *
 * Zenithal formula (frozen v1):
 *   luminance' = clamp(luminance + 30 * cos(angle_to_light_source), 0, 255)
 *   Light angles: top=90°, top-left=135°, top-right=45°
 */

const ZENITHAL_INTENSITY = 30;
const LIGHT_ANGLES: Record<ZenithalDirection, number> = {
  'top': Math.PI / 2,
  'top-left': (3 * Math.PI) / 4,
  'top-right': Math.PI / 4,
};

interface RecolorPreviewProps {
  imageUrl: string | null;
  baseColor: string | null;
  midtone1Color: string | null;
  midtone2Color: string | null;
  highlightColor: string | null;
  zenithalEnabled: boolean;
  zenithalDirection: ZenithalDirection;
  renderStrategy?: RenderStrategy; // v2 hook — only 'canvas' implemented
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Heuristic background detection: sample corners and edges to find dominant bg color
function detectBackgroundColor(imageData: ImageData): [number, number, number, number] {
  const { data, width, height } = imageData;
  const samples: [number, number, number][] = [];
  const samplePositions = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [Math.floor(width / 2), 0], [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)],
  ];

  for (const [x, y] of samplePositions) {
    const idx = (y * width + x) * 4;
    samples.push([data[idx], data[idx + 1], data[idx + 2]]);
  }

  // Average the corner/edge samples
  const avg: [number, number, number] = [
    Math.round(samples.reduce((s, c) => s + c[0], 0) / samples.length),
    Math.round(samples.reduce((s, c) => s + c[1], 0) / samples.length),
    Math.round(samples.reduce((s, c) => s + c[2], 0) / samples.length),
  ];

  // Tolerance for background matching
  const tolerance = 45;
  return [...avg, tolerance];
}

function isBackground(r: number, g: number, b: number, bgColor: [number, number, number, number]): boolean {
  const [br, bg, bb, tol] = bgColor;
  return Math.abs(r - br) < tol && Math.abs(g - bg) < tol && Math.abs(b - bb) < tol;
}

// Overlay blend mode
function blendOverlay(base: number, overlay: number): number {
  const b = base / 255;
  const o = overlay / 255;
  const result = b < 0.5 ? 2 * b * o : 1 - 2 * (1 - b) * (1 - o);
  return Math.round(result * 255);
}

export function RecolorPreview({
  imageUrl,
  baseColor,
  midtone1Color,
  midtone2Color,
  highlightColor,
  zenithalEnabled,
  zenithalDirection,
  renderStrategy = 'canvas',
}: RecolorPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Scale to fit within reasonable bounds
      const maxDim = 600;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      // If no colours assigned, just show the original
      if (!baseColor && !midtone1Color && !highlightColor) return;

      const imageData = ctx.getImageData(0, 0, w, h);
      const { data } = imageData;
      const bgColor = detectBackgroundColor(imageData);

      const basePx = baseColor ? hexToRgb(baseColor) : null;
      const mid1Px = midtone1Color ? hexToRgb(midtone1Color) : null;
      const mid2Px = midtone2Color ? hexToRgb(midtone2Color) : mid1Px;
      const highPx = highlightColor ? hexToRgb(highlightColor) : null;

      const centerX = w / 2;
      const centerY = h / 2;
      const lightAngle = LIGHT_ANGLES[zenithalDirection];
      const opacity = 0.65;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];

          // Skip background pixels
          if (isBackground(r, g, b, bgColor)) continue;

          // Compute raw luminance
          let lum = getLuminance(r, g, b);

          // Apply zenithal directional bias (frozen v1 formula)
          if (zenithalEnabled) {
            const dx = x - centerX;
            const dy = centerY - y; // flip Y so up is positive
            const pixelAngle = Math.atan2(dy, dx);
            const angleDiff = pixelAngle - lightAngle;
            const bias = ZENITHAL_INTENSITY * Math.cos(angleDiff);
            lum = Math.max(0, Math.min(255, lum + bias));
          }

          // 4-zone classification
          let zoneColor: [number, number, number] | null = null;
          if (lum <= 85 && basePx) {
            zoneColor = basePx;
          } else if (lum <= 128 && mid1Px) {
            zoneColor = mid1Px;
          } else if (lum <= 170 && mid2Px) {
            zoneColor = mid2Px;
          } else if (highPx) {
            zoneColor = highPx;
          }

          if (zoneColor) {
            // Greyscale structure: use luminance as base
            const grey = lum / 255;
            const structR = Math.round(grey * 255);
            const structG = Math.round(grey * 255);
            const structB = Math.round(grey * 255);

            // Overlay blend zone colour over greyscale structure
            const blendR = blendOverlay(structR, zoneColor[0]);
            const blendG = blendOverlay(structG, zoneColor[1]);
            const blendB = blendOverlay(structB, zoneColor[2]);

            // Mix with original at opacity
            data[idx] = Math.round(r * (1 - opacity) + blendR * opacity);
            data[idx + 1] = Math.round(g * (1 - opacity) + blendG * opacity);
            data[idx + 2] = Math.round(b * (1 - opacity) + blendB * opacity);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl, baseColor, midtone1Color, midtone2Color, highlightColor, zenithalEnabled, zenithalDirection]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl bg-card border border-border">
        <p className="text-sm text-muted-foreground">Upload an image and assign colours to see the preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} className="rounded-xl border border-border max-w-full" />
      <p className="text-[10px] text-muted-foreground/60 italic">
        Planning preview — not a paint simulation
      </p>
    </div>
  );
}
