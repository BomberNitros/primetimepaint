

# Fix pass — three critical failures

Four targeted changes across 4 files. No other files touched.

## FIX A — `supabase/functions/gemini-repaint/index.ts`

1. **Line 25**: Expand destructuring to include `referenceImages`
2. **Lines 46–69**: Replace anatomy branch — build `content` array dynamically. New prompt text (master miniature painter version). If `referenceImages` is non-empty array, prepend each as `image_url` items and append reference instruction to prompt
3. **Lines 88–106**: Repaint branch — build `content` array dynamically. If `referenceImages` is non-empty, splice reference images after main image. Append reference instruction to prompt
4. Edge function must be redeployed after changes

## FIX B — `src/lib/gemini-pipeline.ts`

1. `analyseAnatomy` — add `referenceImages?: string[]` param, pass in body
2. `generateRepaint` — add `referenceImages?: string[]` param; after building `constructedPrompt`, create `initialSchemeBlock` from regions, replace `{{COLOR_SCHEME_BLOCK}}` to produce `promptToSend`; send `promptToSend` to Gemini, return `constructedPrompt` (token intact); pass `referenceImages` in body
3. `submitCustomRepaint` — add `referenceImages?: string[]` param, pass in body

## FIX C — `src/components/PaintDirectivePanel.tsx`

Replace `handleInject` with the exact implementation from the spec: inline `roleMap` record, `roleInstruction` derivation (with `'other'` → `customRole`, default → `'Standard centrepiece treatment.'`), `primerInstruction` derivation, and sequential `.replace()` calls for all 5 tokens. No functional change to the rest of the component.

## FIX D — `src/components/DualSlider.tsx`

Full rewrite:
- **New props**: add `mainImages: UploadedImage[]` (import from types)
- **Local state**: `zoomImage: string | null`
- **Layout**: `grid grid-cols-2 gap-4` — left "Original" panel, right "AI Repaint" panel, both with `max-h-[350px]`, `cursor-zoom-in`, click to zoom
- **Navigation**: prev/next buttons + counter when `mainImages.length > 1`
- **Lightbox**: fixed z-50 overlay, backdrop/Escape dismisses, X button, `stopPropagation` on image click
- **Escape listener**: `useEffect` with keydown handler, cleanup on unmount

### Callers update

Both `PrimingZenithalPanel` and `ColorPlanPanel` must pass `mainImages={images}` to `DualSlider` (they already receive `images: UploadedImage[]` from Index). Two one-line additions.

## FIX D (Index.tsx)

Pass `state.referenceBase64s` to `analyseAnatomy` and `generateRepaint` in `handleAnalyseAndRepaint`. Pass `state.referenceBase64s` to `submitCustomRepaint` in `handleSubmitRepaint`. Convert reference images to base64 before pipeline calls.

## Files changed

| File | Scope |
|---|---|
| `supabase/functions/gemini-repaint/index.ts` | New prompt, reference images in both branches |
| `src/lib/gemini-pipeline.ts` | Reference images params, token guard |
| `src/components/PaintDirectivePanel.tsx` | Rewrite `handleInject` |
| `src/components/DualSlider.tsx` | Full rewrite with lightbox + nav |
| `src/components/panels/PrimingZenithalPanel.tsx` | Pass `mainImages` to DualSlider |
| `src/components/panels/ColorPlanPanel.tsx` | Pass `mainImages` to DualSlider |
| `src/pages/Index.tsx` | Reference base64 conversion + pipeline args |

