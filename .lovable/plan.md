

# Four UI cleanups

## 1. `src/components/ImageUploader.tsx`

- **Line 70**: Remove `items-center` → `"flex flex-col gap-6 p-8"`
- **Lines 76–78**: Delete the recommendation paragraph
- **Before line 80** (above `{/* Dual dropzones */}`): Insert the conditional hint:
  ```tsx
  {refCount === 0 && !currentlyRepainting && mainCount > 0 && (
    <p className="text-xs text-muted-foreground">
      Drop 4 main photos and a reference. Give the AI something to steal from.
    </p>
  )}
  ```

## 2. `src/components/panels/PrimingZenithalPanel.tsx`

- **Line 96**: `useState(true)` → `useState(false)`

## 3. `src/components/ControlRail.tsx`

- **Line 17**: `label: 'Coloring'` → `label: 'Repaint'`

Three files, five small edits. No logic changes.

