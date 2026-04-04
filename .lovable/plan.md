

# Fix — Reference image base64 append on upload

Two files, two changes.

## FIX 1 — `src/hooks/usePrimetimeState.ts`

After line 63 (after `setReferenceBase64s`), add:

```typescript
const appendReferenceBase64s = useCallback((incoming: string[]) => {
  setState(s => ({
    ...s,
    referenceBase64s: [...(s.referenceBase64s ?? []), ...incoming]
  }));
}, []);
```

Add `appendReferenceBase64s` to the return object (line ~228 area).

## FIX 2 — `src/pages/Index.tsx`

1. **Line 115** — add `appendReferenceBase64s` to the destructuring block
2. **Line 319** — replace `onReferenceImagesChange={files => addReferenceImages(files)}` with:

```typescript
onReferenceImagesChange={async (files) => {
  addReferenceImages(files);
  const base64s = await Promise.all(
    files.map(f => toBase64(f instanceof File ? f : f.file))
  );
  appendReferenceBase64s(base64s);
  console.log('[upload] referenceBase64s stored:', base64s.length);
}}
```

`toBase64` is already imported from `@/lib/gemini-pipeline` (line 18).

## Files changed

| File | Change |
|---|---|
| `src/hooks/usePrimetimeState.ts` | Add `appendReferenceBase64s` helper + expose |
| `src/pages/Index.tsx` | Destructure helper, convert refs to base64 on upload |

