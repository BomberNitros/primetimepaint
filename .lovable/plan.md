

# Move prime color selector and add color swatches overlay

Two files: `ColorPlanPanel.tsx` and `DualSlider.tsx`.

## 1. `src/components/panels/ColorPlanPanel.tsx`

- **Import** `SPEEDPAINT_MOST_WANTED` from `'@/data/speedpaints'`
- **Move** the `OptionButtons` for prime colour (lines 222–231) from the RIGHT column to the LEFT column, immediately after the extracted colors block (after line 185) and before `ThemeSelector`
- **Remove** lines 221–231 from the right column
- **Compute** `activeScheme` and `swatches` array as specified, using `colorSchemes[0]`, override props, and `SPEEDPAINT_MOST_WANTED` lookups
- **Pass** `colorSwatches={swatches}` to `DualSlider` (line 133)

## 2. `src/components/DualSlider.tsx`

- **Add** `colorSwatches?: { label: string; hex: string; name: string }[]` to `DualSliderProps`
- **Add** `position: 'relative'` to the right panel image container (line 155)
- **Inside** that container, after the image/fallback, add an absolutely-positioned overlay anchored bottom-right displaying each swatch as a row with label, color dot, and name

## Files changed

| File | Change |
|---|---|
| `src/components/panels/ColorPlanPanel.tsx` | Move prime color selector to left column, compute swatches, pass to DualSlider |
| `src/components/DualSlider.tsx` | Accept `colorSwatches` prop, render overlay on right panel |

