# Re-arm colour repaint debounce on scheme, theme and override changes

## Current state (verified)

- `src/pages/Index.tsx`, debounced colour repaint effect (lines 544–583): dependency array is `[state.primingRepaintMap, state.sharedSliderIndex]` only. When the active scheme, theme or an override changes, the effect does not re-run, so the colour repaint stays stale until the priming map or slider index changes.
- Debounce interval inside the effect: **6000 ms** with `clearTimeout` on cleanup and on each re-arm — rapid override changes collapse into at most one request 6 s after the last change. Rate-limit safe.
- The effect's `colorCacheKey` (line 554) already includes `activeSchemeIndex`, `selectedTheme` and JSON-serialised `baseOverride` / `midtoneOverrides` / `highlightOverride`. Therefore a re-armed run with unchanged inputs resolves from cache (no Gemini call); a genuinely new combination triggers exactly one new `generateRepaint` request.

## Change (single file: `src/pages/Index.tsx`)

1. In the debounced colour repaint effect's dependency array (line 583), append:
   - `state.activeSchemeIndex`
   - `state.selectedTheme`
   - `state.baseOverride`
   - `state.midtoneOverrides`
   - `state.highlightOverride`
2. Nothing else in the effect changes: same 6000 ms timeout, same cache logic, same `generateRepaint` call, same cleanup.

## Out of scope

- The priming repaint effect (lines ~505–542) keeps its current dependencies.
- Mount/rehydration logic untouched.
- No other files modified. (Wiring `colorSchemeBlock` into the `generateRepaint` call site remains available as a separate follow-up if requested.)

## Verification

- Typecheck passes.
- Confirm via code read that the dependency array matches exactly the seven values and the timer/cache branches are byte-identical to today.
