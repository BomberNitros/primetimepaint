## Implementation: Palette footer strip on repaint downloads

### `src/components/BottomBar.tsx`

1. Add `ColorScheme` to types import.
2. Add `activeScheme: ColorScheme | null` to `BottomBarProps`.
3. Destructure `activeScheme` in component.
4. Add helper `composeWithPaletteStrip(dataUrl: string): Promise<string>`:
   - Load image via `new Image()` (set `crossOrigin = 'anonymous'`, await `onload`).
   - If `activeScheme` is null, return original dataUrl.
   - Build colors array: `[base, midtone1, midtone2?, highlight]` filtered.
   - Create canvas sized `img.width` x `img.height + 64`.
   - Draw image at (0, 0).
   - Fill strip rect (0, h, w, 64) with `#1a1a1a`.
   - Compute `swatchWidth = (w - 8*(n+1)) / n`. For each swatch i:
     - Draw `20px` swatch at `x = 8 + i*(swatchWidth+8)`, `y = h + 8`, fill with paint hex.
     - Set `ctx.fillStyle = '#fff'`, `font = '11px sans-serif'`, `textBaseline = 'top'`.
     - Truncate name to fit `swatchWidth` (measure, append `…` while too wide).
     - Draw text at `x`, `y = h + 8 + 20 + 6` (= h + 34).
   - Return `canvas.toDataURL('image/png')`.
5. Replace single-thumbnail `onClick` to call `composeWithPaletteStrip(entry.image)` then `downloadDataUrl`. Make handler async.
6. In `handleDownloadAll`:
   - Single-entry branch: compose then download.
   - Multi-entry branch: await compose for each, strip prefix, add to zip.

### `src/pages/Index.tsx`

Pass `activeScheme={state.colorSchemes[state.activeSchemeIndex] ?? null}` to `<BottomBar />`.

### Out of scope
No other files, no styling changes outside the strip composition, no changes to `downloadDataUrl` helper signature.
