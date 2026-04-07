

# Replace PaintDirectivePanel with read-only prompt display

## Summary

Completely rewrite `PaintDirectivePanel.tsx` to be a thin display component. The prompt assembly logic has moved upstream to `Index.tsx`, so this component now just shows the assembled prompt (read-only) and collects miniature details via passed-in setters.

The two consumers (`ColorPlanPanel.tsx` and `PrimingZenithalPanel.tsx`) must update their JSX to pass the new props.

## Files changed

| File | Change |
|---|---|
| `src/components/PaintDirectivePanel.tsx` | Full rewrite — new props interface, read-only prompt display, miniature form, no template logic |
| `src/components/panels/ColorPlanPanel.tsx` | Update `PaintDirectivePanel` JSX props to match new interface |
| `src/components/panels/PrimingZenithalPanel.tsx` | Update `PaintDirectivePanel` JSX props to match new interface |

## Detail

### 1. `PaintDirectivePanel.tsx` — full replacement

- **New props**: `assembledPrompt: string`, `onSubmit`, `currentlyRepainting`, `submitError`, `miniature` object (with name/origin/manufacturer/role/customRole + setters)
- **Removed**: `activePrompt`, `onPromptChange`, `zenithalEnabled`, `primeColor` props; all `useState` for form fields; `useRef`/tick pattern; `useEffect` template substitution; "Inject into prompt" button
- **Layout**: Collapsible (closed by default), two-column grid when open
  - Left: `<div>` with `whitespace-pre-wrap` showing `assembledPrompt` (read-only, not a textarea)
  - Right: miniature details form (name, origin, manufacturer, role select, conditional customRole input), "Apply paint directive" primary button calling `onSubmit`, error display
- Button disabled when `currentlyRepainting || !assembledPrompt`

### 2. `ColorPlanPanel.tsx` and `PrimingZenithalPanel.tsx`

Both panels currently pass `activePrompt`, `onPromptChange`, `zenithalEnabled`, `primeColor` to `PaintDirectivePanel`. These will be replaced with `assembledPrompt`, `miniature`, and the existing `onSubmit`/`currentlyRepainting`/`submitError` props. The parent props interfaces for both panels will need `assembledPrompt` and `miniature` added, and the old prompt/primer props removed from the `PaintDirectivePanel` call sites.

This also requires `Index.tsx` to pass `assembledPrompt` and `miniature` down through both panel components — but since those are already available in Index, it's just prop threading.

