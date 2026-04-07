

# Increase debounce timeouts and guard swatches

## 1. `src/pages/Index.tsx`

- **Line 344**: Change priming debounce timeout from `2000` to `5000`
- **Line 390**: Change colour debounce timeout from `2500` to `6000`

## 2. `src/components/panels/ColorPlanPanel.tsx`

- **Line 124**: Change `const activeScheme = colorSchemes[0];` to `const activeScheme = colorSchemes?.[0];`
- **Lines 125–147**: Wrap the swatches array in a ternary: `const swatches = activeScheme ? [ ... ].filter(Boolean) as ... : [];`

The existing optional chaining on `activeScheme?.base`, `activeScheme?.midtone1`, `activeScheme?.highlight` is already correct — no additional chaining needed inside the array.

Two files, four small edits.

