

# Simplify colour repaint compression input

## Change

**`src/pages/Index.tsx`** — in the colour repaint background effect, replace three lines:

```typescript
const raw64 = await toBase64(img.file);
const rawBase64 = raw64.split(',')[1];
const { data: compressedData, mimeType } = await compressBase64Image(rawBase64);
```

with one line:

```typescript
const { data: compressedData, mimeType } = await compressBase64Image(primingImage);
```

This feeds the already-available `primingImage` base64 string directly into compression, removing the redundant file-to-base64 conversion.

## Files changed

| File | Change |
|---|---|
| `src/pages/Index.tsx` | 3 lines → 1 line in colour repaint effect |

