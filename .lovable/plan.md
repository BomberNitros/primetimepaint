

# Three targeted fixes

## FIX 1 — Remove hardcoded shading line

**File: `src/lib/gemini-pipeline.ts`**

Delete lines 63–64 (the shading instruction and blank line). Line 62 (`It is primed in neutral grey.`) flows directly into line 65 (`---`).

## FIX 2 — PaintDirectivePanel button fixes

**File: `src/components/PaintDirectivePanel.tsx`**

1. Line 152: Add `type="button"` to the inject `<Button>`
2. Line 226: Add `type="button"` to the submit `<Button>`

The inline onClick logic and all useState declarations are already present and correct.

## FIX 3 — DualSlider rewrite

**File: `src/components/DualSlider.tsx`**

Full rewrite preserving existing functionality, adding:
- Optional props: `leftLabel?: string`, `rightLabel?: string`
- Label rows with inline "Zoom" text buttons above each panel
- `type="button"` on all `<button>` elements
- Batch download button (`col-span-2`, below navigation) — collects non-null images and triggers `<a>` download for each
- Existing lightbox + Escape listener preserved

No caller changes needed.

## Files changed

| File | Change |
|---|---|
| `src/lib/gemini-pipeline.ts` | Delete lines 63–64 |
| `src/components/PaintDirectivePanel.tsx` | Add `type="button"` to 2 buttons |
| `src/components/DualSlider.tsx` | Full rewrite with zoom buttons, batch download |

