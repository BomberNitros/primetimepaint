

# Fix — Edge function reference image format

## Problem
Reference images are pushed into the content array without size filtering or data URI prefix guarantee. Raw base64 strings without `data:` prefix fail at the gateway.

## Changes — `supabase/functions/gemini-repaint/index.ts`

1. **Delete line 27** — remove `console.log` diagnostic
2. **Replace lines 40–41** (`hasRefs` variable) with `refParts` builder:
   ```typescript
   const refParts = Array.isArray(referenceImages) && referenceImages.length > 0
     ? referenceImages
         .filter((r: unknown) => typeof r === 'string' && (r as string).length < 800_000)
         .map((r: string) => ({
           type: 'image_url',
           image_url: {
             url: r.startsWith('data:') ? r : `data:image/jpeg;base64,${r}`
           }
         }))
     : [];
   ```

3. **Anatomy branch (lines 65–77)** — Merge prompt suffix into the text part, build content array in one shot:
   ```typescript
   const content: unknown[] = [
     ...refParts,
     { type: 'image_url', image_url: { url: image } },
     { type: 'text', text: anatomyPrompt
       + (refParts.length > 0
         ? '\n\nREFERENCE IMAGES PROVIDED ABOVE: Extract their palette, mood, contrast level, and technique. Apply what you learn to your color recommendations.'
         : '') }
   ];
   ```
   The old `hasRefs` check on lines 65–68 and the loop on lines 70–77 are both replaced.

4. **Repaint branch (lines 109–122)** — Same pattern:
   ```typescript
   const content: unknown[] = [
     { type: 'image_url', image_url: { url: image } },
     ...refParts,
     { type: 'text', text: prompt
       + (refParts.length > 0
         ? '\n\nREFERENCE IMAGES PROVIDED ABOVE: Match their palette, contrast level, brushwork character, and atmosphere in the repaint.'
         : '') }
   ];
   ```
   Delete the old `repaintPrompt` variable (lines 109–112) — the suffix is now inline.

5. **Redeploy** and confirm deployment succeeds.

## What is NOT changed
- Model names, gateway URL, auth headers, response parsing
- No other files

## Files changed

| File | Change |
|---|---|
| `supabase/functions/gemini-repaint/index.ts` | `refParts` builder with size filter + data URI prefix, simplified content arrays, remove console.log |

