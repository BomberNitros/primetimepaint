

# Build Plan — Three Sections

## Section 1 — Panel headings: apply Primetime font family

All seven `<h2>` elements confirmed as panel-level section titles. Import `randomFont` from `ControlRail.tsx` and add `style={{ fontFamily: \`'${randomFont}', sans-serif\` }}` to each.

| File | Line |
|---|---|
| `src/components/ImageUploader.tsx` | 46 — "Miniature" ✓ |
| `src/components/panels/PrimingZenithalPanel.tsx` | ~110 — "Priming" |
| `src/components/panels/BrushGuidePanel.tsx` | ~22 — "Brush guide" |
| `src/components/panels/PaintPlanPanel.tsx` | ~65 — "Thinning & application" |
| `src/components/panels/PaintHandlingPanel.tsx` | ~99 — "Handling" |
| `src/components/panels/FinishVarnishPanel.tsx` | ~36 — "Finish & varnish" |
| `src/components/panels/ColorPlanPanel.tsx` | ~69 — "Colour plan" |

Font family only. No size/weight/colour changes.

## Section 2 — Remove spray override warning from Priming panel

Delete the conditional amber warning box and the "Override spray warning" `ToggleOption` from `PrimingZenithalPanel.tsx`. Remove unused props (`sprayOverride`, `onSprayOverrideChange`) and imports if they become dead code.

## Section 3 — Wet palette ratio warnings

In `PaintPlanPanel.tsx`, append text to two existing bullet strings:
- **50/50** 💡 tip: append wet palette quick-use warning
- **25/75** ⚠️ warning: append dry palette recommendation

No new bullets, no layout changes.

