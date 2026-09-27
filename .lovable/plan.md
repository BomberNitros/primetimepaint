# Editable repaint prompt — pass `activePrompt` through to Gemini

## Current state (verified)

- `generateRepaint` already accepts a trailing optional 7th parameter `fullPromptOverride?: string` — when non-empty it is sent verbatim, skipping the constructed prompt and the `{{COLOR_SCHEME_BLOCK}}` injection.
- The two `generateRepaint` call sites in `src/pages/Index.tsx` (line ~568 in the debounced colour-repaint effect, line ~636 in `handleAnalyseAndRepaint`) currently pass 6 arguments ending with `buildColorSchemeBlock(...)`.
- `state.activePrompt` (initially `null`) and `setActivePrompt` exist in `usePrimetimeState`; `handlePromptChange` (line 721) already calls `setActivePrompt`. Neither is currently passed to `ColorPlanPanel`.
- `ColorPlanPanel` receives 21 props; it renders `PaintDirectivePanel` (read-only) but has no editable prompt field.

## Changes

### 1. `src/pages/Index.tsx`

- Debounced colour-repaint effect call site (~line 568): append `state.activePrompt ?? undefined` as the 7th argument.
- `handleAnalyseAndRepaint` call site (~line 636): append `state.activePrompt ?? undefined` as the 7th argument.
- In the `case "color-plan"` JSX (~line 779), add two props to `<ColorPlanPanel>`:
  - `activePrompt={state.activePrompt}`
  - `onPromptChange={handlePromptChange}`

### 2. `src/components/panels/ColorPlanPanel.tsx`

- Add to `ColorPlanPanelProps`: `activePrompt: string | null` and `onPromptChange: (p: string) => void`; destructure both.
- Render a labelled textarea (shadcn `Textarea` if available in the project, otherwise a styled `<textarea>` with Tailwind classes — no inline styles) bound to `activePrompt ?? ''`, `onChange` → `onPromptChange(e.target.value)`.
- Placement: inside the `pipelineComplete` section, directly below the paint-directive panel, before the submit button. Label: "Repaint prompt" with a one-line helper: "Leave empty to use the automatic prompt. Anything typed here replaces it entirely."
- UI copy: sentence case, British English, no placeholder filler.

## Behaviour after this change

- With an empty prompt field: repaints behave exactly as today (auto-generated prompt with scheme block).
- With text typed in the field: that exact text is the prompt sent to `gemini-repaint`, verifiable in the network request body.
- Note (no change made, per scope): `state.activePrompt` is not in the debounced effect's dependency array, so typing a prompt does not itself re-arm the repaint debounce; the new prompt takes effect on the next repaint trigger (scheme/theme/override change, slider change, or "Apply paint directive").

## Out of scope

- No changes to `gemini-pipeline.ts`, `BottomBar.tsx`, `usePrimetimeState.ts`, the effect's trigger logic or dependency array.
