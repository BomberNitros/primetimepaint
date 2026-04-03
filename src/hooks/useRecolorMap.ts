import { useEffect, useState, useRef } from 'react';
import { UploadedImage, ZenithalDirection } from '@/types/primetime';
import { recolorImage, RecolorParams } from '@/lib/recolor-engine';

/**
 * Recolors ALL uploaded images whenever colour params change.
 * Returns a map of image.id → recolored data URL (or null if not yet processed).
 */
export function useRecolorMap(
  images: UploadedImage[],
  params: RecolorParams,
): Record<string, string | null> {
  const [recolorMap, setRecolorMap] = useState<Record<string, string | null>>({});
  const runIdRef = useRef(0);

  useEffect(() => {
    if (images.length === 0) {
      setRecolorMap({});
      return;
    }

    const runId = ++runIdRef.current;

    (async () => {
      const results: Record<string, string | null> = {};
      for (const img of images) {
        if (runIdRef.current !== runId) return; // cancelled
        const dataUrl = await recolorImage(img.objectUrl, params);
        results[img.id] = dataUrl;
      }
      if (runIdRef.current === runId) {
        setRecolorMap(results);
      }
    })();
  }, [
    images.map(i => i.id).join(','),
    params.baseColor,
    params.midtone1Color,
    params.midtone2Color,
    params.highlightColor,
    params.zenithalEnabled,
    params.zenithalDirection,
  ]);

  return recolorMap;
}
