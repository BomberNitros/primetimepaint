

# Add `primeColor` parameter to `generateRepaint`

Two files, two small edits.

## 1. `src/lib/gemini-pipeline.ts`

**Line 58–59** — add `primeColor: PrimeColor` after `subjectName`:
```typescript
  subjectName: string,
  primeColor: PrimeColor,
  referenceImages?: string[],
```

**Lines 68–69** — replace hardcoded primer line:
```typescript
  const primerDesc: Record<PrimeColor, string> = {
    black: 'It is primed in black.',
    grey:  'It is primed in neutral grey.',
    white: 'It is primed in white.',
  };

  const constructedPrompt = `You are digitally repainting a physical tabletop miniature. The subject is ${subjectName}.
${primerDesc[primeColor]}
```

`PrimeColor` is already imported on line 7.

## 2. `src/pages/Index.tsx`

**Line 280** — pass `state.primeColor` between `'miniature figure'` and `refBase64s`:
```typescript
const { image, prompt } = await generateRepaint(base64, regions, "miniature figure", state.primeColor, refBase64s);
```

## Files changed

| File | Change |
|---|---|
| `src/lib/gemini-pipeline.ts` | Add `primeColor` param; dynamic primer description |
| `src/pages/Index.tsx` | Pass `state.primeColor` to `generateRepaint` |

