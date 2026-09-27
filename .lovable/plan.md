# generateRepaint: accept external colour scheme block

## Change
`src/lib/gemini-pipeline.ts`, function `generateRepaint` only.

1. Add a parameter `colorSchemeBlock?: string` (optional, appended after `referenceImages`) so existing callers in `Index.tsx` keep compiling unchanged — `Index.tsx` is explicitly out of scope.
2. Replace the token injection: the `{{COLOR_SCHEME_BLOCK}}` placeholder is substituted with `colorSchemeBlock` when it is a non-empty string; otherwise fall back to the existing `initialSchemeBlock` (anatomy-derived) so the prompt never ships an empty colour section.
3. Keep `initialSchemeBlock` construction (needed as fallback). Remove the two `console.log` diagnostics inside `generateRepaint` (`[pipeline] referenceImages count` and `[pipeline] promptToSend preview`) — workspace rules ban console statements in committed code.

## Result
Prompts sent to the `gemini-repaint` edge function now carry the block built by `buildColorSchemeBlock()` — active scheme names/hexes plus `OVERRIDE`-prefixed base/midtone/highlight directives — instead of raw anatomy regions alone, once the caller passes the block.

## Out of scope (per instruction)
`recolor-engine.ts`, `zenithal-preview.ts`, `Index.tsx`, and every other file. Wiring the call site to pass `buildColorSchemeBlock(...)` output is a separate step.
