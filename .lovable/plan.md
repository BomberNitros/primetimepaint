

# Slider fix — six files, one architectural change

## Summary
Split `repaintMap` into `primingRepaintMap` and `colorRepaintMap`, fully rewrite `DualSlider` with purple glow styling and shared index navigation, and update both panel callers.

## Changes

### 1. `src/types/primetime.ts` (line 124)
Replace `repaintMap: Record<number, string>` with:
```
primingRepaintMap: Record<number, string>
colorRepaintMap: Record<number, string>
```

### 2. `src/hooks/usePrimetimeState.ts`
- Replace `repaintMap: {}` in initialState with `primingRepaintMap: {}` and `colorRepaintMap: {}`
- Remove `setRepaintMapEntry`. Add `setPrimingRepaintEntry` and `setColorRepaintEntry` (both `(index: number, value: string)` merging into respective map)
- Update return object

### 3. `src/pages/Index.tsx`
- Destructure `setPrimingRepaintEntry` and `setColorRepaintEntry` instead of `setRepaintMapEntry`
- Line 239: `setRepaintMapEntry(...)` → `setPrimingRepaintEntry(state.sharedSliderIndex, image)`
- Line 280: `setRepaintMapEntry(...)` → `setColorRepaintEntry(state.sharedSliderIndex, result)`
- **PrimingZenithalPanel call** (lines 337–362): Remove `originalImage`, `customRepaintImage`, `repaintMap`. Add `sharedSliderIndex`, `onSliderIndexChange`, `primingRepaintMap`
- **ColorPlanPanel call** (lines 367–391): Remove `originalImage`, `customRepaintImage`, `repaintMap`. Add `sharedSliderIndex`, `onSliderIndexChange`, `primingRepaintMap`, `colorRepaintMap` (keep existing `zenithalEnabled`, `primeColor`)

### 4. `src/components/DualSlider.tsx` — full rewrite
- **Props**: `leftImages`, `rightImages`, `sharedIndex`, `onIndexChange`, `primingHint?`
- **Local state**: `zoomImage`, `zoomScale`, `zoomOffset`, `isDragging`, `dragStart`
- **Purple glow style** const for all badges
- **Layout**: 2-col CSS grid. Each side: glow-labelled header + 320px image container (click to zoom). Right side placeholder: "Repaint pending"
- **Navigation**: col-span-2 shared ← Prev / glow counter / Next → (only when max count > 1). Inline styles for buttons (no Tailwind classes per user spec)
- **Lightbox**: Fixed overlay with glow-styled ✕, label + zoom% + Reset badges, hint bar at bottom centre. Imperative wheel zoom, drag-to-pan, Escape key — three useEffects as specified

### 5. `src/components/panels/PrimingZenithalPanel.tsx`
- Update interface: remove `originalImage`, `customRepaintImage`, `repaintMap`. Add `sharedSliderIndex: number`, `onSliderIndexChange: (i: number) => void`, `primingRepaintMap: Record<number, string>`
- DualSlider call (replacing current lines 128–141):
  - `leftImages` = mainImages mapped to `{ src: img.objectUrl, label: 'Unprimed' }`
  - `rightImages` = mainImages mapped through `primingRepaintMap[i]` — keep all entries, empty src shows placeholder
  - `sharedIndex` / `onIndexChange` from props

### 6. `src/components/panels/ColorPlanPanel.tsx`
- Update interface: remove `originalImage`, `customRepaintImage`, `repaintMap`. Add `sharedSliderIndex: number`, `onSliderIndexChange: (i: number) => void`, `primingRepaintMap: Record<number, string>`, `colorRepaintMap: Record<number, string>`
- DualSlider call:
  - `leftImages` = mainImages mapped through `primingRepaintMap[i]` — keep all entries
  - `rightImages` = mainImages mapped through `colorRepaintMap[i]` — keep all entries
  - `primingHint` = zenithal/prime colour summary string
  - `sharedIndex` / `onIndexChange` from props

### Critical constraint
Do NOT filter rightImages arrays — keep all entries including empty `src` to preserve index alignment. DualSlider shows "Repaint pending" for empty src.

## Files changed

| File | Change |
|---|---|
| `src/types/primetime.ts` | Split `repaintMap` → two maps |
| `src/hooks/usePrimetimeState.ts` | Two entry setters, remove old one |
| `src/pages/Index.tsx` | Wire new setters + new panel props |
| `src/components/DualSlider.tsx` | Full rewrite with shared index, glow, lightbox |
| `src/components/panels/PrimingZenithalPanel.tsx` | New DualSlider props |
| `src/components/panels/ColorPlanPanel.tsx` | New DualSlider props |

