# generateRepaint: add fullPromptOverride parameter

## Scope
One file only: `src/lib/gemini-pipeline.ts`. No changes to `Index.tsx`, `BottomBar.tsx`, the edge function, or any other file.

## Current state (verified)
- `generateRepaint(imageBase64, regions, subjectName, primeColor, referenceImages?: string[], colorSchemeBlock?: string)` builds `constructedPrompt` from the anatomy regions, injects the scheme block into the `{{COLOR_SCHEME_BLOCK}}` token, and sends the result as `prompt` in the body to `gemini-repaint`.
- The function returns `{ image, prompt: constructedPrompt }`.

## Change
1. Add a new trailing optional parameter: `fullPromptOverride?: string`.
2. Early in the function, decide the prompt to send:
   - If `fullPromptOverride` is provided and non-empty (after trim check on length), use it directly as `promptToSend` — skip building `constructedPrompt`, `regionBlock`, `primerDesc`, `initialSchemeBlock`, and the `{{COLOR_SCHEME_BLOCK}}` injection entirely (no wasted construction).
   - Otherwise, run the existing construction path unchanged.
3. The `supabase.functions.invoke` body and everything after (error handling, image prefixing, return) keep their existing structure; only the `prompt` value differs by path.
4. Return value:
   - Override path: `{ image, prompt: promptToSend }` — the caller-supplied prompt, since `constructedPrompt` was skipped.
   - Default path: unchanged — `{ image, prompt: constructedPrompt }`.

## Implementation notes
- Cheapest structural approach: wrap the prompt construction in a conditional so the heavy construction only runs when `fullPromptOverride` is absent; `promptToSend` and `returnedPrompt` are set from whichever path ran.
- No changes to any other export (`analyseAnatomy`, `generatePrimingRepaint`, `submitCustomRepaint`, `buildColorSchemeBlock`), no signature reordering, no call-site changes — existing callers compile untouched.

## Result
When a caller passes `fullPromptOverride`, that exact string is sent verbatim to the `gemini-repaint` edge function with no token injection or anatomy/scheme text appended. When omitted, behaviour is byte-identical to today.
