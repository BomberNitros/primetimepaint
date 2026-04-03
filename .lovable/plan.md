

# Plan: Zenithal Preview Canvas Processing

## Files

| File | Action |
|---|---|
| `src/lib/zenithal-preview.ts` | **New** — canvas processing function |
| `src/pages/Index.tsx` | **Edit** — replace placeholder `primingResultMap` with reactive `useEffect` |

## 1. New file: `src/lib/zenithal-preview.ts`

**Exports:** `processZenithalPreview(source, settings)` and `ZenithalSettings` interface.

**Processing logic:**

- Draw source image to canvas at natural dimensions
- If `!zenithalEnabled` or `method === 'flat'` → flat tint only:
  - Black: `multiply`, `rgba(0,0,0,0.60)`
  - Grey: `multiply`, `rgba(128,128,128,0.40)`
  - White: `screen`, `rgba(255,255,255,0.30)`
  - Return early
- Map direction to angle: `top` → 270°, `top-left` → 315°, `top-right` → 225°
- Helper `angleToGradientPoints(angle, w, h)` converts to `createLinearGradient` coordinates
- **2-tone**: two passes
  - Pass A (`multiply`): black 75% → neutral white at light end
  - Pass B (`screen`): transparent → white 55%
- **3-tone**: three passes
  - Pass A (`multiply`): black 80% → neutral (bottom 50%)
  - Pass B (`overlay`): grey 40% across middle band (30%–70% stops)
  - Pass C (`screen`): transparent → white 60% (top 40%)
- Reset `globalCompositeOperation` to `source-over`, return canvas

## 2. Edit: `src/pages/Index.tsx`

**Lines 1**: Add `useState` to the React import.

**Lines 140–142**: Replace the placeholder with:

```ts
const [primingResultMap, setPrimingResultMap] = useState<Record<string, string | null>>({});

useEffect(() => {
  if (mainImages.length === 0) {
    setPrimingResultMap({});
    return;
  }

  const urls: string[] = [];
  let cancelled = false;

  const processAll = async () => {
    const newMap: Record<string, string | null> = {};
    for (const img of mainImages) {
      if (cancelled) return;
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.src = img.objectUrl;
      await new Promise<void>(r => { el.onload = () => r(); el.onerror = () => r(); });
      if (cancelled) return;

      await new Promise<void>(r => requestAnimationFrame(() => r()));

      const result = processZenithalPreview(el, {
        zenithalEnabled: state.zenithalEnabled,
        zenithalMethod: state.zenithalScheme,
        zenithalDirection: state.zenithalDirection,
        primeColour: state.primeColor,
      });

      const blob = await new Promise<Blob | null>(r => result.toBlob(r, 'image/png'));
      if (cancelled || !blob) return;

      const url = URL.createObjectURL(blob);
      urls.push(url);
      newMap[img.id] = url;
    }
    if (!cancelled) setPrimingResultMap(newMap);
  };

  processAll();

  return () => {
    cancelled = true;
    urls.forEach(URL.revokeObjectURL);
  };
}, [mainImages.length, state.primeColor, state.zenithalEnabled, state.zenithalScheme, state.zenithalDirection]);
```

Add import for `processZenithalPreview` from `@/lib/zenithal-preview`.

## Not changed

- No UI changes to any panel, slider, or sidebar
- No changes to recolour pipeline, colour plan, or export
- No new dependencies

