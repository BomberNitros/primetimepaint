# Lightbox overlay: light chip labels in DualSlider

## Goal
All text inside the zoomed-image lightbox in `src/components/DualSlider.tsx` renders as black text on a light chip, legible over any image. The main (non-zoomed) comparison view stays visually unchanged.

## Changes — single file: `src/components/DualSlider.tsx`

### 1. New style constant (next to `glowStyle`, ~line 28)
Add `zoomLabelStyle: React.CSSProperties` with the same `padding`, `borderRadius`, `fontSize`, `fontWeight`, `display`, `alignItems`, `whiteSpace` values as `glowStyle`, but:
- `background: 'rgba(255,255,255,0.92)'`
- `border: '1px solid rgba(0,0,0,0.1)'`
- `boxShadow: 'none'`
- `color: '#000000'`

`glowStyle` itself is not modified.

### 2. Lightbox block (`{zoomImage && (...)}`, lines 221–309) — swap every `glowStyle` to `zoomLabelStyle`
- Close button (line 228, spread `{ ...glowStyle, position... }` → `{ ...zoomLabelStyle, ... }`)
- Label span (line 235)
- Zoom percentage span (line 236)
- "Reset" button (line 239)
- Nav strip: "← Prev set" button (257), page-count span (262), "Next set →" button (265), "View repaint →" / "← View original" button (272)

### 3. Bottom instruction text (lines 279–284)
Replace the plain div text (currently `color: '#a78bfa'`, no background) with a span using `zoomLabelStyle`, keeping the same text "Scroll zoom · Drag pan · ← → images · ↑↓ toggle side · Esc close" and the wrapper div's positioning.

### Untouched
- `glowStyle` and all main-grid labels/buttons outside the lightbox
- The `colorSwatches` overlay (lines 170–190)
- No other files (Index.tsx, ColorPlanPanel.tsx, PrimingZenithalPanel.tsx, ImageSlider.tsx untouched)

## Verification
- Typecheck/build clean.
- Playwright: open the lightbox in the preview and confirm close button, labels, nav strip, and instruction text render as black-on-light chips; main comparison view unchanged.
