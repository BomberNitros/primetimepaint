/**
 * Canvas-based dominant colour extraction from uploaded images.
 * Samples pixels and clusters by proximity to find dominant colours.
 */

export function extractDominantColors(imageUrl: string, count: number = 6): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 100; // downsample for speed
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve([]); return; }

      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      // Simple k-means-like clustering
      const pixels: [number, number, number][] = [];
      for (let i = 0; i < data.length; i += 4) {
        // Skip very dark or very light (likely background)
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 20 && lum < 235) {
          pixels.push([r, g, b]);
        }
      }

      if (pixels.length === 0) { resolve([]); return; }

      // Simple quantization by rounding to nearest 32
      const buckets = new Map<string, { sum: [number, number, number]; count: number }>();
      for (const [r, g, b] of pixels) {
        const key = `${Math.round(r / 32)},${Math.round(g / 32)},${Math.round(b / 32)}`;
        const bucket = buckets.get(key);
        if (bucket) {
          bucket.sum[0] += r;
          bucket.sum[1] += g;
          bucket.sum[2] += b;
          bucket.count++;
        } else {
          buckets.set(key, { sum: [r, g, b], count: 1 });
        }
      }

      const sorted = Array.from(buckets.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, count);

      const colors = sorted.map(b => {
        const r = Math.round(b.sum[0] / b.count);
        const g = Math.round(b.sum[1] / b.count);
        const bl = Math.round(b.sum[2] / b.count);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
      });

      resolve(colors);
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}
