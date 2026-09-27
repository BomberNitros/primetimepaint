# Move miniature details to the upload step

Move the "Paint directive" miniature-details panel out of the colour-plan step and show it on the initial upload screen instead, so the fields are filled in before any pipeline run.

Note: the panel lives at `src/components/PaintDirectivePanel.tsx` (not `panels/`). Only `src/pages/Index.tsx` and `src/components/panels/ColorPlanPanel.tsx` are modified.

## Changes

### 1. `src/pages/Index.tsx` — show the panel on the upload step
- Add `import { PaintDirectivePanel } from '@/components/PaintDirectivePanel';`
- In `renderWorkspace()`, `case "upload"` (~line 740): wrap the existing `<ImageUploader ... />` in a fragment and render `<PaintDirectivePanel miniature={miniature} />` above it, inside the same return block. Nothing else in the case changes.

### 2. `src/components/panels/ColorPlanPanel.tsx` — remove it from the colour-plan step
- Delete the `{/* 3. Paint directive */}` block that renders `<PaintDirectivePanel miniature={miniature} />` under `pipelineComplete`.
- Remove the now-unused `PaintDirectivePanel` import line (same file).
- Leave everything else untouched: the editable "Paint directive" textarea, the submit button, all props, and all other files (including `PaintDirectivePanel.tsx` and `ImageUploader.tsx`).

## Result
- Upload screen shows the miniature-details fields (name, origin, manufacturer, role) before any pipeline run.
- Colour-plan step no longer shows them; the editable directive field and "Apply paint directive" button stay as they are.
- The panel's existing collapsible behaviour and styling are unchanged (its own file is not edited).

## Verification
- Typecheck/build clean.
- Playwright check: upload step renders the miniature-details fields; the colour-plan step does not.
