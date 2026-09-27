# Route the typed prompt directly into "Apply paint directive"

## Goal

The "Apply paint directive" button sends the user's typed text verbatim (no prepended context) when a prompt is typed, and the auto-generated context text when the field is empty. The auto-assembled memo stops embedding the typed prompt.

## File

`src/pages/Index.tsx` only.

## Changes

1. **`assembledPrompt` useMemo (~line 350)**
   - Remove `state.activePrompt ?? '',` and the following blank line from the `lines` array — it starts directly with `'--- Miniature context ---'`.
   - Remove `state.activePrompt` from the memo's dependency array.

2. **`handleSubmitRepaint` (~line 691)**
   - Resolve the prompt once at the top of the callback: `const resolvedPrompt = state.activePrompt || assembledPrompt;`
   - Change the submission call from `submitCustomRepaint(base64, assembledPrompt, refBase64s)` to `submitCustomRepaint(base64, resolvedPrompt, refBase64s)`.
   - In the `geminiHistory` entry, log `resolvedPrompt` instead of `assembledPrompt` as `textContent`.
   - Add `state.activePrompt` to the callback's dependency array (it no longer arrives via `assembledPrompt`).
   - Optional guard refinement: the early return currently checks `!assembledPrompt`; keep behaviour identical unless it blocks a typed-only prompt — leave as-is per instructions.

## Untouched

`ColorPlanPanel.tsx`, `gemini-pipeline.ts`, the edge function, and all other files.

## Verification

- Typecheck and build clean.
- Live preview: enter prompt text in the colour-plan field, run "Apply paint directive", confirm the `gemini-repaint` request body contains exactly the typed text with no `--- Miniature context ---` prefix; clear the field and confirm the auto-generated context text is sent instead.
