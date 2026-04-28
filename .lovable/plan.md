# Persistence layer — images, repaints, session state

Three files. Native IndexedDB wrapper, sessionStorage autosave, on-mount rehydration. No new dependencies.

## 1. `src/lib/primetime-db.ts` (new)

Native IndexedDB. DB `primetime-db`, version 1.

Stores (created in `onupgradeneeded`):
- `images` — keyPath `id` — `{ id, file, type }`
- `repaints` — keyPath `key` — `{ key, data }`

Module-level cached `Promise<IDBDatabase>` reused by all functions. Each operation wraps a transaction in a Promise resolving on `oncomplete` / rejecting on `onerror`.

Exports:
- `initDB(): Promise<void>`
- `saveImage(id, file, type): Promise<void>` — `put` into `images`
- `loadImages(): Promise<Array<{id,file,type}>>` — `getAll`
- `clearImages(): Promise<void>` — `clear`
- `saveRepaint(key, data): Promise<void>` — `put` into `repaints`
- `loadRepaints(): Promise<Array<{key,data}>>` — `getAll`
- `clearRepaints(): Promise<void>` — `clear`

## 2. `src/hooks/usePrimetimeState.ts`

Add a `useEffect` watching `state` that writes the serialized subset to `sessionStorage['primetime-session']`:

```
{ activeStep, primeColor, zenithalEnabled, zenithalScheme, zenithalMethod,
  zenithalDirection, selectedTheme, activeSchemeIndex, baseOverride,
  midtoneOverrides, highlightOverride, pipelineComplete, sharedSliderIndex }
```

Wrapped in try/catch (private-mode safety). No other changes.

## 3. `src/pages/Index.tsx`

### One-time mount rehydration
- Add `rehydratedRef = useRef(false)` (StrictMode guard).
- In `useEffect(() => { ... }, [])`: if already rehydrated, return; else mark true and run:
  1. `await initDB()`
  2. Read `sessionStorage['primetime-session']`. If present, parse and apply via setters: `setActiveStep`, `setPrimeColor`, `setZenithalEnabled`, `setZenithalScheme`, `setZenithalMethod`, `setZenithalDirection`, `setSelectedTheme`, `setActiveSchemeIndex`, `setBaseOverride`, `setMidtoneOverrides`, `setHighlightOverride`, `setPipelineComplete`, `setSharedSliderIndex`. Set `themeInteracted.current = true` and `overrideInteracted.current = true` so the auto-select effects don't overwrite restored `activeSchemeIndex`.
  3. `await loadImages()` → split by `type`, call `addMainImages(mainFiles)` and `addReferenceImages(refFiles)`. Reference color extraction fires automatically via the existing effect keyed on `state.referenceImages.length`.
  4. `await loadRepaints()` → parse `priming-N` / `color-N` and dispatch via `setPrimingRepaintEntry(N, data)` / `setColorRepaintEntry(N, data)`.
- Do NOT call `generateRepaint`, `generatePrimingRepaint`, or `handleAnalyseAndRepaint` during rehydration.

### Image persistence (covers uploads + rehydration in one effect)
- Add `savedImageIdsRef = useRef<Set<string>>(new Set())`.
- Add `useEffect` on `[state.mainImages, state.referenceImages]`: iterate both arrays; for any `id` not already in `savedImageIdsRef.current`, call `saveImage(id, img.file, img.type)` (fire-and-forget) and add the id to the Set.

### Image remove
- Replace `onRemove={removeImage}` on `BottomBar` with a wrapper `handleRemoveImage(id)`:
  1. `removeImage(id)`
  2. `savedImageIdsRef.current.delete(id)`
  3. `await clearImages()`
  4. For each remaining image in `state.mainImages` + `state.referenceImages` (filtered to exclude the removed id), call `saveImage(...)` and re-add the id to the Set.

### Repaint persistence
- After every `setPrimingRepaintEntry(idx, primingImage)` (lines 384, 407, 499) → `saveRepaint(\`priming-${idx}\`, primingImage)` (fire-and-forget).
- After every `setColorRepaintEntry(idx, image)` (lines 447, 463, 504, 555) → `saveRepaint(\`color-${idx}\`, image)` (fire-and-forget).

## Scope lock
- No layout, scheme, theme, or repaint-execution changes
- Only the three files listed
- No new npm dependencies (native IndexedDB only)
