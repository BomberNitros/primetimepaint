

# Add `generatePrimingRepaint` + multi-image loop pipeline

Two files changed.

## 1. `src/lib/gemini-pipeline.ts` — add `generatePrimingRepaint`

Insert after line 110 (after `generateRepaint` closes). New function:

```typescript
export async function generatePrimingRepaint(
  imageBase64: string,
  subjectName: string,
  referenceImages?: string[]
): Promise<{ image: string; prompt: string }> {
  const prompt = `You are digitally applying a zenithal primer coat to a physical tabletop miniature. The subject is ${subjectName}.

ZENITHAL PRIMING TECHNIQUE:
- Pure white from directly above (top of model, raised surfaces, highest points)
- Mid-grey on sides and angled surfaces receiving less light
- Deep shadow grey to near-black in recesses, undercuts, and lowest points
- No colour whatsoever — this is monochrome undercoat only

PAINTING STYLE:
- Hand-primed tabletop miniature. Not a render. Not a digital illustration.
- Subtle spray texture visible. No airbrushed smoothness.

DO NOT:
- Add, remove, or reshape any sculpted surface features.
- Repaint the base, groundwork, or scenic elements.
- Add backgrounds, glow, bloom, lens flare, or atmospheric effects.
- Change the photo angle or framing.
- Add any colour — this is primer only.

OUTPUT: Same photo angle and framing as input. Miniature with zenithal primer applied as described above.`;

  const { data, error } = await supabase.functions.invoke('gemini-repaint', {
    body: { type: 'repaint', image: imageBase64, prompt, referenceImages },
  });

  if (error) throw new Error(error.message ?? 'Priming repaint failed.');
  if (data?.error) throw new Error(data.error);

  const prefix = 'data:image/png;base64,';
  const image = data.image.startsWith(prefix) ? data.image : `${prefix}${data.image}`;
  return { image, prompt };
}
```

## 2. `src/pages/Index.tsx`

**Import** (line 20): add `generatePrimingRepaint` to the import block.

**Replace `handleAnalyseAndRepaint`** (lines 220–263) with:

```typescript
const handleAnalyseAndRepaint = useCallback(async () => {
  if (mainImages.length === 0 || state.currentlyRepainting) return;
  setPipelineError(null);
  setCurrentlyRepainting(true);
  setRepaintStartTime(new Date());
  const startTime = Date.now();

  try {
    const refBase64s = await Promise.all(
      state.referenceImages.map(img => toBase64(img.file))
    );

    for (let i = 0; i < mainImages.length; i++) {
      setSharedSliderIndex(i);
      const base64 = await toBase64(mainImages[i].file);

      const regions = await analyseAnatomy(base64, refBase64s);

      const { image: primingImage } = await generatePrimingRepaint(
        base64, 'miniature figure', refBase64s
      );
      setPrimingRepaintEntry(i, primingImage);

      const { image, prompt } = await generateRepaint(
        base64, regions, 'miniature figure', refBase64s
      );
      setColorRepaintEntry(i, image);

      if (i === 0) {
        setAnatomyRegions(regions);
        setInitialRepaintImage(image);
        setCustomRepaintImage(image);
        setActivePrompt(prompt);

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        setGeminiHistory([
          { role: 'user', textContent: 'Anatomy analysis', hasImage: true },
          { role: 'model', textContent: JSON.stringify(regions), hasImage: false },
          { role: 'user', textContent: prompt, hasImage: true },
          { role: 'model', imageContent: image, hasImage: true },
        ]);
        setRepaintLog(prev => [...prev, {
          section: 'initial',
          timestamp: new Date(),
          elapsedSeconds: elapsed,
        }]);
        setRepaintHistory(prev => [...prev, { label: 'Initial repaint', image }]);
      }
    }

    setSharedSliderIndex(0);
    setPipelineComplete(true);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Pipeline failed.';
    setPipelineError(message);
  } finally {
    setCurrentlyRepainting(false);
  }
}, [mainImages, state.currentlyRepainting, state.referenceImages]);
```

Key differences from current code:
- Guards on `mainImages.length === 0` instead of `!mainImage`
- Converts references once before the loop
- Loops all images: priming repaint → `setPrimingRepaintEntry`, colour repaint → `setColorRepaintEntry`
- First image (`i === 0`) preserves all existing side-effects
- Resets slider to 0 after loop, then sets pipeline complete

## Files changed

| File | Change |
|---|---|
| `src/lib/gemini-pipeline.ts` | Add `generatePrimingRepaint` export after `generateRepaint` |
| `src/pages/Index.tsx` | Import `generatePrimingRepaint`, replace `handleAnalyseAndRepaint` with multi-image loop |

