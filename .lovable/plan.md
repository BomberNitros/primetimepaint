

# Fix build error + DualSlider lightbox navigation

Two files changed.

## 1. `src/lib/gemini-pipeline.ts` — add missing `generatePrimingRepaint`

The types are already imported (lines 7–14). Insert after line 117 (after `generateRepaint` closes), before `submitCustomRepaint`:

- Private helper `buildPrimingSettingsBlock(primeColor, zenithalEnabled, zenithalScheme, zenithalMethod, zenithalDirection)` — maps each setting to descriptive prompt text, returns joined string
- Exported `generatePrimingRepaint(imageBase64, subjectName, primeColor, zenithalEnabled, zenithalScheme, zenithalMethod, zenithalDirection, referenceImages?)` — builds dynamic prompt via the helper, calls `supabase.functions.invoke('gemini-repaint')`, returns `{ image, prompt }`

This fixes the TS2724 build error.

## 2. `src/components/DualSlider.tsx` — lightbox navigation

- **Line 18** — extend `zoomImage` state type to `{ src: string; label: string; slot: 'left' | 'right'; index: number } | null`
- **Line 109** — left panel click: `setZoomImage({ ...leftItem, slot: 'left', index: sharedIndex })`
- **Line 130** — right panel click: `setZoomImage({ ...rightItem, slot: 'right', index: sharedIndex })`
- **Before return** — add `zoomNavigate(newSlot, newIndex)` helper that resets zoom/offset, updates `zoomImage`, and calls `onIndexChange`
- **Lines 69–76** — replace Escape-only handler with full keyboard handler:
  - `Escape` closes lightbox
  - `ArrowLeft` / `ArrowRight` navigates prev/next image within same slot
  - `ArrowUp` / `ArrowDown` toggles between left and right slot at same index
- **Lines 196–201** — replace hint bar with nav strip containing:
  - Prev set / Next set buttons (disabled at bounds)
  - Index counter badge (`1 / N`)
  - Slot toggle button ("View repaint →" / "← View original")
  - Updated hint text: `Scroll zoom · Drag pan · ← → images · ↑↓ toggle side · Esc close`

## Files changed

| File | Change |
|---|---|
| `src/lib/gemini-pipeline.ts` | Insert `buildPrimingSettingsBlock` + `generatePrimingRepaint` after line 117 |
| `src/components/DualSlider.tsx` | Extend zoomImage state; update click handlers; add zoomNavigate; full keyboard handler; lightbox nav strip |

