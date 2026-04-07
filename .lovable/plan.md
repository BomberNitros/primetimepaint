

# Add miniature details hook, fix colour extraction, assemble prompt, update submit

One file: `src/pages/Index.tsx`.

## 1. Add `useMiniatureDetails` hook (before `Index` component, ~line 136)

Define a small hook returning `{ name, setName, origin, setOrigin, manufacturer, setManufacturer, role, setRole, customRole, setCustomRole }`. Destructure as `const miniature = useMiniatureDetails();` inside Index, after the existing destructuring block (~line 176).

## 2. Fix extracted colours — use reference images

Replace the `useEffect` at lines 189–198 (which reads `mainImages[0]`) with the version that maps over `state.referenceImages`, merges with `Set`, and depends on `state.referenceImages.length`.

## 3. Add `assembledPrompt` via `useMemo`

After the miniature destructure, add the `useMemo` block that builds a multi-line prompt from `state.activePrompt`, miniature details, role map, primer note, scheme note, and theme note. Dependencies: `state.activePrompt`, `state.primeColor`, `state.zenithalEnabled`, `state.selectedTheme`, `state.colorSchemes`, `state.baseOverride`, `state.midtoneOverrides`, `state.highlightOverride`, plus all miniature fields.

**Import**: Add `useMemo` to the React import at line 1.

## 4. Update `handleSubmitRepaint` (lines 467–509)

- **Guard** (line 468): Change from `!state.activePrompt` to `!assembledPrompt || !mainImage || state.currentlyRepainting`
- **Call** (line 478): Change `state.activePrompt` to `assembledPrompt` in `submitCustomRepaint`
- **History** (line 491): Change `state.activePrompt` to `assembledPrompt` in the gemini history turn
- **Deps** (line 509): Change `state.activePrompt` to `assembledPrompt`

Also remove the `console.log` on line 477 per project rules (no console.log in committed code).

## Files changed

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Hook definition, extracted colours fix, assembledPrompt memo, handleSubmitRepaint update |

