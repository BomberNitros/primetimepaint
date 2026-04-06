

# Wire `backgroundRepainting` through RepaintTimer and ControlRail

Three files, prop-threading only.

## 1. `src/components/RepaintTimer.tsx`

- **Line 5**: Add `backgroundRepainting: boolean` to `RepaintTimerProps`
- **Line 11**: Destructure `backgroundRepainting` in the function signature
- **Line 20**: Change condition from `currentlyRepainting && repaintStartTime` to `(currentlyRepainting || backgroundRepainting) && repaintStartTime`
- **Line 27**: Change condition from `!currentlyRepainting && status === 'active'` to `!currentlyRepainting && !backgroundRepainting && status === 'active'`
- **Line 39**: Update deps array from `[currentlyRepainting]` to `[currentlyRepainting, backgroundRepainting]`

## 2. `src/components/ControlRail.tsx`

- **Line 41** (ControlRailProps): Add `backgroundRepainting: boolean` after `currentlyRepainting`
- **Line 51** (destructuring): Add `backgroundRepainting`
- **Line 97** (RepaintTimer JSX): Add `backgroundRepainting={backgroundRepainting}` prop

## 3. `src/pages/Index.tsx`

- **Line 613** (ControlRail JSX): Add `backgroundRepainting={state.backgroundRepainting}` prop

