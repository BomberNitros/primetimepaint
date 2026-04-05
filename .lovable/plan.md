

# Targeted fix — ColorPlanPanel.tsx

## Change
Line 108: Replace `'Recoloured'` with `'Repainted'`

That is the only difference between the current code and the requested block. Everything else (prop names, array mappings, no filtering, no `img.objectUrl` in leftImages, no `primingRepaintMap` in rightImages) already matches exactly.

## Files changed

| File | Change |
|---|---|
| `src/components/panels/ColorPlanPanel.tsx` | Line 108: `label: 'Recoloured'` → `label: 'Repainted'` |

