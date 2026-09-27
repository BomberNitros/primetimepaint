# Snap anatomy colours to Speedpaint Most Wanted

## Goal
`analyseAnatomy()` currently returns whatever free-form colour names and hexes the AI invents for each region. After this change, every region's `baseColor`, `shadowColor`, and `highlightColor` will be snapped to the nearest real Speedpaint Most Wanted entry, so downstream prompts and previews only ever see real paint names and hexes.

## Change (single file: `src/lib/gemini-pipeline.ts`)

1. **Import the palette**
   ```ts
   import { SPEEDPAINT_MOST_WANTED } from "@/data/speedpaints";
   ```

2. **Add a local `snapToSpeedpaint(hex: string)` helper** (not exported, placed near the top of the file). It mirrors `closestPaint()` in `Index.tsx`:
   - Parse the hex into r/g/b with `parseInt(hex.slice(...), 16)`.
   - Loop over `SPEEDPAINT_MOST_WANTED`, parse each entry's hex, compute squared Euclidean RGB distance `(r-pr)**2 + (g-pg)**2 + (b-pb)**2`.
   - Return the closest entry as `{ name, hex }` (only the fields `AnatomyRegion` colours need — `lidColor` is dropped).

3. **Apply the snap in `analyseAnatomy()`**, after `const regions: AnatomyRegion[] = data.regions;` and before the existing primer/background diagnostic warning and `return regions;`:
   ```ts
   const snapped = regions.map((r) => ({
     ...r,
     baseColor: snapToSpeedpaint(r.baseColor.hex),
     shadowColor: snapToSpeedpaint(r.shadowColor.hex),
     highlightColor: snapToSpeedpaint(r.highlightColor.hex),
   }));
   ```
   `region`, `description`, and `surfaceNote` are preserved untouched via the spread. Return `snapped`.

## Explicitly untouched
- The edge function (`supabase/functions/gemini-repaint/index.ts`) and `anatomyPrompt` text.
- Every other file, including `Index.tsx` (its `closestPaint()` stays as-is) and `src/data/speedpaints.ts`.
- The diagnostic warning block in `analyseAnatomy()` keeps working — it reads the (already snapped) hexes.

## Downstream effect (no code needed)
Because `generateRepaint()` and `buildColorSchemeBlock()` build their "Base: name (hex)" lines from `regions`, the repaint prompt and fallback colour-scheme block will now always quote real Speedpaint Most Wanted names and hexes. Active-scheme values and OVERRIDE directives continue to flow through unchanged.

## Verification
- Build must be clean.
- Confirm by inspection that every colour leaving `analyseAnatomy()` originates from `SPEEDPAINT_MOST_WANTED` — i.e. any returned `baseColor`/`shadowColor`/`highlightColor` name+hex pair matches an entry in `src/data/speedpaints.ts`.
