# Override precedence directive in gemini-repaint edge function

## Goal
Make `gemini-3.1-flash-image-preview` visibly favour OVERRIDE-prefixed colour directives over anatomical baseline colours and reference-image tone bias in repaint generations.

## Current state (verified)
`supabase/functions/gemini-repaint/index.ts` builds the repaint request as one user message: `{ miniature image }, { reference images }, { text: prompt + optional reference note }`. There is **no** system directive and **no** precedence instruction — the model gets only the client prompt, so OVERRIDE tokens carry no stated authority over the image's existing colours or the reference palette note.

## Change — one file only: `supabase/functions/gemini-repaint/index.ts`

In the `type === 'repaint'` branch, extend the text part that accompanies the prompt (line ~131) with a precedence directive appended after the prompt text:

```text
COLOR DIRECTIVE PRECEDENCE (ABSOLUTE):
- Any token or instruction prefixed with OVERRIDE: is a binding paint directive.
- OVERRIDE directives always take absolute precedence over:
  1. the anatomical baseline colours of the input image,
  2. the tones present in any reference image,
  3. any other colour suggestion in this prompt.
- Repaint every referenced region to the exact OVERRIDE colour (name and hex).
- When an OVERRIDE conflicts with a reference image's palette, follow the OVERRIDE.
```

Placement: appended to the same template string, before the existing conditional `REFERENCE IMAGES PROVIDED ABOVE` note, so the reference note reads as subordinate context.

## Explicitly unchanged
- Request payload construction (same single user message, same `messages` array shape — no system message added)
- Reference image handling (`refParts` filtering, data-URI prefixing, and the existing reference note stay as-is)
- Anatomy branch, response parsing, error handling, retry logic
- No other file — `gemini-pipeline.ts`, `Index.tsx`, and the preview engines are untouched

## Result
The repaint prompt the edge function sends will carry an explicit precedence rule, so generations should follow the OVERRIDE base/midtone/highlight directives (wired in via `colorSchemeBlock` from the earlier pipeline change) rather than drifting to anatomy defaults or reference tones.

## Verification
- Typecheck/build clean.
- Deploy the edge function; send a test repaint request via the deployed URL to confirm the directive text reaches the model and the function still returns an image.
- Full visual confirmation (OVERRIDE colours visibly honoured) requires a live repaint run with a completed pipeline.
