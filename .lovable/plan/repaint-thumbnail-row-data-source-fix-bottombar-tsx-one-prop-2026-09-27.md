# Repaint thumbnail row data source fix — BottomBar.tsx (+ one prop line in Index.tsx)

## Goal
The repaint thumbnail row (and "Download Repaints" button) currently reads `state.repaintHistory`, an ephemeral in-memory array that doesn't survive reload and isn't the same data the rest of the app persists. Switch it to the persisted repaint maps so cached repaints appear reliably after reload.

## Constraint note
BottomBar receives repaints only via props — `state.colorRepaintMap` and `state.primingRepaintMap` are never passed to it today, so they are unreachable from BottomBar alone. The minimal exception is **one prop line in Index.tsx** (line 864): replace `repaintHistory={state.repaintHistory}` with the two map props. No other Index.tsx changes. If even that line is off-limits, the task cannot be done in BottomBar.tsx alone.

## Changes

### src/components/BottomBar.tsx
1. Props: remove `repaintHistory: RepaintHistoryEntry[]`; add
   `colorRepaintMap: Record<number, string>` and
   `primingRepaintMap: Record<number, string>`. Drop the now-unused `RepaintHistoryEntry` import.
2. Derive entries with `useMemo`:
   - keys = ascending union of both maps' keys
   - entry shape: `{ index: number; image: string }` with
     `image = colorRepaintMap[i] ?? primingRepaintMap[i]` (colour repaint takes precedence)
3. Use `repaintEntries` everywhere `repaintHistory` is used today:
   - thumbnail rendering (click → download via existing `composeWithPaletteStrip` + `downloadDataUrl`)
   - filenames become `repaint-{entry.index + 1}.png` (index-stable, not array-position-based)
   - `handleDownloadAll` (single → one PNG; multiple → `repaints.zip` via JSZip, index-based names)
   - visibility of the "Download Repaints" button
4. Wrap the thumbnail row in
   `<div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 min-w-0">`
   so a long row scrolls horizontally inside the bar instead of stretching it.

### src/pages/Index.tsx (single line only)
- Line 864: `repaintHistory={state.repaintHistory}` →
  `colorRepaintMap={state.colorRepaintMap}`
  `primingRepaintMap={state.primingRepaintMap}`

## Out of scope
- No new state, no map mutation, no changes to `gemini-pipeline.ts`, `usePrimetimeState`, recolour engines, or any other file.
- No layout, styling, or toast changes beyond the scroll wrapper.

## Verification
- Typecheck/build clean.
- Playwright check on the preview: with repaints present in state, thumbnails render from the union of both maps; after a reload with persisted repaints, the row still shows them (IndexedDB rehydration feeds the same maps).
