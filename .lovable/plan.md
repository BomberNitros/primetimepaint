
# Fix `gemini-repaint` startup-safe repaint request

## What I found
In `supabase/functions/gemini-repaint/index.ts`, the repaint request body currently uses:

```ts
model: 'google/gemini-2.0-flash-preview-image-generation'
```

and there is no `generationConfig` block present in the live file.

## Plan
Update only the repaint model call in `supabase/functions/gemini-repaint/index.ts`:

```ts
body: JSON.stringify({
  model: 'google/gemini-3.1-flash-image-preview',
  messages: [{ role: 'user', content }],
  generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  stream: false,
}),
```

## Scope
- Change the repaint `model` back to `google/gemini-3.1-flash-image-preview`
- Add `generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }`
- Do not touch the anatomy branch
- Do not change any surrounding logic, parsing, retries, or response handling
- One file only: `supabase/functions/gemini-repaint/index.ts`

## Why this should resolve it
- It restores the requested model name
- It uses the Gemini-specific response-modality field instead of `modalities`
- It keeps the edit to a single request-body block, which minimises the chance of introducing another startup error
