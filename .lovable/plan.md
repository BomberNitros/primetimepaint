

# Fix pass — five targeted failures

## FIX 1 — Per-image repaint result map

**Files:** `src/types/primetime.ts`, `src/hooks/usePrimetimeState.ts`, `src/pages/Index.tsx`

1. Add `repaintMap: Record<number, string>` to `PrimetimeState` (line 126, after `customRepaintImage`)
2. Add `repaintMap: {}` to `initialState` (line 34, after `customRepaintImage: null`)
3. Add `setRepaintMapEntry` callback in hook:
   ```
   const setRepaintMapEntry = useCallback((index: number, value: string) => {
     setState(s => ({ ...s, repaintMap: { ...s.repaintMap, [index]: value } }));
   }, []);
   ```
4. Expose `setRepaintMapEntry` in return object
5. In `Index.tsx`:
   - Destructure `setRepaintMapEntry` from hook (line 113 area)
   - Line 232: after `setCustomRepaintImage(image)`, add `setRepaintMapEntry(state.sharedSliderIndex, image)`
   - Line 268: after `setCustomRepaintImage(result)`, add `setRepaintMapEntry(state.sharedSliderIndex, result)`
   - Line 341: change to `customRepaintImage={state.repaintMap[state.sharedSliderIndex] ?? state.customRepaintImage}`
   - Line 369: same change

## FIX 2 — DualSlider full rewrite

**File:** `src/components/DualSlider.tsx`

Complete rewrite with:
- `zoomImage` as `{ src: string; label: string } | null` + `zoomScale`, `zoomOffset`, `isDragging`, `dragStart` state
- CSS grid `gridTemplateColumns: '1fr 1fr'`, `gap: '1rem'`, `alignItems: 'stretch'`
- Fixed 320px height image containers with `object-contain`
- Label rows from `leftLabel`/`rightLabel` props
- Lightbox: imperative wheel listener via `useEffect` with `{ passive: false }` (not React onWheel), drag-to-pan via window mousemove/mouseup, reset button, zoom % badge, hint text
- Escape key listener via separate `useEffect`
- Navigation (Prev/Next) and batch download preserved, all `type="button"`

## FIX 3 — PaintDirectivePanel injection via useEffect

**File:** `src/components/PaintDirectivePanel.tsx`

Current inline onClick (lines 154–213) works but spec demands useEffect pattern:
1. Add `const lastProcessedTick = useRef(0)` and `const [injectTick, setInjectTick] = useState(0)`
2. Inject button onClick becomes `() => setInjectTick(t => t + 1)`
3. Move roleMap + primerInstruction + all `.replace()` calls into `useEffect` watching `[injectTick, activePrompt, name, origin, manufacturer, role, customRole, zenithalEnabled, primeColor]`
4. Guard: `if (injectTick === 0 || injectTick === lastProcessedTick.current) return; lastProcessedTick.current = injectTick;`

## FIX 4 — Diagnostic logs

**Files:** `src/lib/gemini-pipeline.ts`, `supabase/functions/gemini-repaint/index.ts`

- In `generateRepaint` before line 96 invoke: add `console.log('[pipeline] referenceImages count:', referenceImages?.length ?? 0)` and `console.log('[pipeline] promptToSend preview:', promptToSend.slice(0, 200))`
- In edge function after line 25 destructuring: add `console.log('[edge] referenceImages count:', Array.isArray(referenceImages) ? referenceImages.length : 0)`
- Redeploy edge function

## FIX 5 — Caller label props

**Files:** `src/components/panels/PrimingZenithalPanel.tsx`, `src/components/panels/ColorPlanPanel.tsx`

- PrimingZenithalPanel DualSlider (line 129–135): add `leftLabel="Primed"` `rightLabel="AI Repaint"`
- ColorPlanPanel DualSlider (line 102–108): add `leftLabel="Original"` `rightLabel="AI Repaint"`

## Files changed

| File | Change |
|---|---|
| `src/types/primetime.ts` | Add `repaintMap` field |
| `src/hooks/usePrimetimeState.ts` | Add `repaintMap` initial + `setRepaintMapEntry` helper |
| `src/pages/Index.tsx` | Store repaint in map, pass mapped value to panels |
| `src/components/DualSlider.tsx` | Full rewrite with zoom/pan lightbox, imperative wheel |
| `src/components/PaintDirectivePanel.tsx` | useEffect-based inject with lastProcessedTick guard |
| `src/lib/gemini-pipeline.ts` | Diagnostic logs |
| `supabase/functions/gemini-repaint/index.ts` | Diagnostic log + redeploy |
| `src/components/panels/PrimingZenithalPanel.tsx` | Pass leftLabel/rightLabel to DualSlider |
| `src/components/panels/ColorPlanPanel.tsx` | Pass leftLabel/rightLabel to DualSlider |

