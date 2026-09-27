# Wire buildColorSchemeBlock into both generateRepaint call sites

## Change
`src/pages/Index.tsx` only.

1. Add `buildColorSchemeBlock` to the existing import from `@/lib/gemini-pipeline` (line 17–23).
2. Debounced colour-repaint effect (line 567): pass a 6th argument after `refBase64s`:
   `buildColorSchemeBlock(state.anatomyRegions, state.colorSchemes[state.activeSchemeIndex] ?? null, state.baseOverride, state.midtoneOverrides, state.highlightOverride)`
3. `handleAnalyseAndRepaint` (line 634): pass the identical 6th argument after `refBase64s`.

## Result
Every repaint request to `gemini-repaint` now carries a prompt whose COLOR SCHEME section layers anatomy defaults, the active scheme's names/hexes, and `OVERRIDE`-prefixed base/midtone/highlight directives (when set), instead of falling back to raw anatomy-derived values. `generateRepaint` already prefers this argument, and the edge function's precedence directive makes it binding.

## Out of scope
`gemini-pipeline.ts`, `BottomBar.tsx`, and every other file. No changes to cache keys, debounce, dependency arrays, or trigger logic.
