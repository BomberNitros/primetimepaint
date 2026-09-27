# Repaint divider in BottomBar.tsx

## Goal
Visually separate the source-image thumbnails from the repaint thumbnails in the bottom bar with a labelled divider, shown only when repaints exist.

## Changes — src/components/BottomBar.tsx (only file)

In the render, between the closing of the `{images.map(...)}` block (currently lines 120–144) and the `<div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 min-w-0">` wrapper for `repaintEntries` (line 146), insert:

```tsx
{repaintEntries.length > 0 && (
  <div className="flex-shrink-0 flex items-center gap-2 h-14">
    <div className="w-px h-full bg-border" />
    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Repaints</span>
  </div>
)}
```

- The 1px bar uses `bg-border`, full thumbnail height (`h-14` = 56px, matching the `w-14 h-14` thumbnails).
- Label text "Repaints", uppercase via Tailwind, sentence-case source text per workspace rules.
- No changes to thumbnail rendering, `repaintEntries`, download button, or any other file.

## Verification
- Build/typecheck clean.
- Playwright smoke on the preview: with repaints present, the divider and label appear between the source and repaint thumbnails; with no repaints, nothing renders between them.
