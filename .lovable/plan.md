

# Repaint panel layout and copy cleanup

Two files. No logic changes — layout, labels, and copy only.

## 1. `src/components/PaintDirectivePanel.tsx`

- Remove `onSubmit`, `currentlyRepainting`, `submitError` from `PaintDirectivePanelProps` (lines 16–18)
- Remove them from the destructured props (lines 24–26)
- Delete the submit button (lines 123–130) and error display (lines 132–134)

## 2. `src/components/panels/ColorPlanPanel.tsx`

Rewrite the JSX return (lines 155–266) to this vertical order:

### Position 1–2: Title + subtitle (unchanged)

### Position 3: DualSlider / ImageSlider (unchanged)

### Position 4: PaintDirectivePanel + external submit
- Pass only `assembledPrompt` and `miniature` to `PaintDirectivePanel` (remove `onSubmit`, `currentlyRepainting`, `submitError`)
- Render submit button and error directly in `ColorPlanPanel`, below the panel:
  ```tsx
  <button onClick={onSubmitRepaint} disabled={currentlyRepainting || !assembledPrompt}>
    {currentlyRepainting ? 'Repainting…' : 'Apply paint directive'}
  </button>
  {submitError && <p className="text-xs text-destructive">{submitError}</p>}
  ```

### Position 5: Schemes row (full-width)
- Move schemes out of the left column into a standalone full-width block
- Title: "Schemes" — description: "Extracted reference-based paint plan shown as the baseline set of colours."
- `grid grid-cols-3 gap-4` layout, always visible

### Position 6: Disclaimer
```
Your selections update the paint directive text. Repaint images do not
refresh automatically when you change settings. Submit a new paint
directive to regenerate the repainted previews.
```
Style: `text-sm text-muted-foreground leading-relaxed`

### Position 7: Two-column row

**Left column** — title: "Palette"
1. Priming colour (rename label from "Prime colour" to "Priming colour")
2. Extracted colours

**Right column** — title: "Colour & theory"
1. Theme — add section title "Theme" + description: "Stylistic interpretation applied on top of the baseline to generate a themed variation."
2. Colour theory helper
3. Colour overrides — add description above `ColorRoleSelector`: "Manual colour replacements for specific paint roles or areas."

### What moves where
| Component | From | To |
|---|---|---|
| Submit button + error | Inside `PaintDirectivePanel` | `ColorPlanPanel` position 4 |
| Schemes | Left column | Full-width row position 5 |
| ThemeSelector | Left column | Right column (with title/desc) |
| Priming colour + Extracted colours | Left column | Left column (only remaining items) |

### Props interface
`PaintDirectivePanelProps`: remove `onSubmit`, `currentlyRepainting`, `submitError`. No new props.
`ColorPlanPanelProps`: unchanged (already has `onSubmitRepaint`, `currentlyRepainting`, `submitError`).

