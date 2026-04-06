

# Add caching refs and colour repaint effect to Index.tsx

One file: `src/pages/Index.tsx`.

## Changes

### 1. Add cache refs after `primingDebounceRef` (line 262)

After line 262, insert four new refs:
- `primingCacheRef` — `Map<string, string>` for caching priming results by key
- `colorCacheRef` — `Map<string, string>` for caching colour repaint results
- `colorDebounceRef` — timeout ref for colour repaint debounce
- `sliderIndexRef` — tracks `state.sharedSliderIndex` for use inside async closures

### 2. Add sync effect for `sliderIndexRef`

Small `useEffect` keeping `sliderIndexRef.current` in sync with `state.sharedSliderIndex`.

### 3. Replace priming background effect (lines 264–316)

Replace the existing priming `useEffect` with a cache-aware version:
- Builds a cache key from `img.id + primeColor + zenithal*` settings
- On cache hit → calls `setPrimingRepaintEntry` immediately, no API call, no toast
- On cache miss → calls API, stores result in cache, then sets entry
- Same dependency array as before

### 4. Insert new colour repaint effect after priming effect

New `useEffect` that fires when `state.primingRepaintMap` or `state.sharedSliderIndex` changes:
- Reads the current priming image for the active slider index
- Builds a colour cache key from image + settings
- On cache hit → sets colour repaint entry immediately
- On cache miss → calls `generateRepaint` with the priming image as input, caches result
- 2500ms debounce; silent catch (best-effort)

## Behaviour summary

| Scenario | Result |
|---|---|
| Slider to cached image | Instant, no API call |
| Slider to uncached image | Priming API → cached, then colour API → cached |
| Settings change | Cache miss → priming call → colour call auto-fires |
| Repeated same settings | Cache hit on both |

## Files changed

| File | Change |
|---|---|
| `src/pages/Index.tsx` | 4 new refs, 1 sync effect, rewritten priming effect with cache, new colour repaint effect |

