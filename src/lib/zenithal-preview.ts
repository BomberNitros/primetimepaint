export interface ZenithalSettings {
  zenithalEnabled: boolean;
  zenithalMethod: 'flat' | '2tone' | '3tone';
  zenithalDirection: 'top' | 'top-left' | 'top-right';
  primeColour: 'black' | 'grey' | 'white';
}

function angleToGradientPoints(
  angleDeg: number,
  w: number,
  h: number,
): [number, number, number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.max(w, h);
  const dx = Math.cos(rad) * len;
  const dy = Math.sin(rad) * len;
  return [cx - dx, cy - dy, cx + dx, cy + dy];
}

function applyFlatTint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  primeColour: ZenithalSettings['primeColour'],
): void {
  if (primeColour === 'white') {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
  } else if (primeColour === 'grey') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(128,128,128,0.40)';
  } else {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0,0,0,0.60)';
  }
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

export function processZenithalPreview(
  source: HTMLImageElement | HTMLCanvasElement,
  settings: ZenithalSettings,
): HTMLCanvasElement {
  const w = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(source, 0, 0, w, h);

  if (!settings.zenithalEnabled || settings.zenithalMethod === 'flat') {
    applyFlatTint(ctx, w, h, settings.primeColour);
    return canvas;
  }

  const directionAngles: Record<ZenithalSettings['zenithalDirection'], number> = {
    'top': 270,
    'top-left': 315,
    'top-right': 225,
  };
  const angle = directionAngles[settings.zenithalDirection];
  const [x0, y0, x1, y1] = angleToGradientPoints(angle, w, h);

  if (settings.zenithalMethod === '2tone') {
    // Pass A — dark (multiply): shadow end → light end
    ctx.globalCompositeOperation = 'multiply';
    const darkGrad = ctx.createLinearGradient(x1, y1, x0, y0);
    darkGrad.addColorStop(0, 'rgba(0,0,0,0.75)');
    darkGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, w, h);

    // Pass B — light (screen): light end → shadow end
    ctx.globalCompositeOperation = 'screen';
    const lightGrad = ctx.createLinearGradient(x0, y0, x1, y1);
    lightGrad.addColorStop(0, 'rgba(255,255,255,0)');
    lightGrad.addColorStop(1, 'rgba(255,255,255,0.55)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, w, h);
  } else {
    // 3-tone
    // Pass A — dark (multiply): bottom 50%
    ctx.globalCompositeOperation = 'multiply';
    const darkGrad = ctx.createLinearGradient(x1, y1, x0, y0);
    darkGrad.addColorStop(0, 'rgba(0,0,0,0.80)');
    darkGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    darkGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, w, h);

    // Pass B — mid (overlay): middle band 30%–70%
    ctx.globalCompositeOperation = 'overlay';
    const midGrad = ctx.createLinearGradient(x1, y1, x0, y0);
    midGrad.addColorStop(0, 'rgba(128,128,128,0)');
    midGrad.addColorStop(0.3, 'rgba(128,128,128,0.40)');
    midGrad.addColorStop(0.7, 'rgba(128,128,128,0.40)');
    midGrad.addColorStop(1, 'rgba(128,128,128,0)');
    ctx.fillStyle = midGrad;
    ctx.fillRect(0, 0, w, h);

    // Pass C — light (screen): top 40%
    ctx.globalCompositeOperation = 'screen';
    const lightGrad = ctx.createLinearGradient(x0, y0, x1, y1);
    lightGrad.addColorStop(0, 'rgba(255,255,255,0)');
    lightGrad.addColorStop(0.6, 'rgba(255,255,255,0)');
    lightGrad.addColorStop(1, 'rgba(255,255,255,0.60)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.globalCompositeOperation = 'source-over';
  return canvas;
}
