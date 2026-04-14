

# Repaint active scheme state and selection wiring

Five files. Adds `activeSchemeIndex`, wires auto-selection with first-render guards, updates preview/prompt to use active scheme, makes scheme cards clickable.

## 1. `src/types/primetime.ts`
Add `activeSchemeIndex: number` after `colorSchemes` in `PrimetimeState`.

## 2. `src/hooks/usePrimetimeState.ts`
- `selectedTheme: 'grimdark'` (was `null`)
- `activeSchemeIndex: 0` in initial state
- `setActiveSchemeIndex` setter + export

## 3. `src/pages/Index.tsx`

**Destructure** `setActiveSchemeIndex` from `usePrimetimeState()`.

**Two refs** at component level:
```ts
const themeInteracted = useRef(false);
const overrideInteracted = useRef(false);
```

**assembledPrompt** (line 214): `state.colorSchemes?.[0]` → `state.colorSchemes?.[state.activeSchemeIndex]`. Add `state.activeSchemeIndex` to deps.

**Preview colours** (lines 271–275): replace with active-scheme-only reads, drop `getOverrideHex` fallbacks.

**handleThemeSelect** (lines 337–343): set `themeInteracted.current = true`, call `setActiveSchemeIndex(1)`.

**Override effect** (new, after line 269):
```ts
useEffect(() => {
  if (!overrideInteracted.current) { overrideInteracted.current = true; return; }
  if (state.baseOverride || state.midtoneOverrides.length > 0 || state.highlightOverride) {
    setActiveSchemeIndex(2);
  }
}, [state.baseOverride, state.midtoneOverrides, state.highlightOverride]);
```

**ColorPlanPanel props** (~line 630): add `activeSchemeIndex` and `onSchemeSelect`.

## 4. `src/components/panels/ColorPlanPanel.tsx`
Accept `activeSchemeIndex` and `onSchemeSelect` props. Pass `isActive={i === activeSchemeIndex}` and `onSelect={() => onSchemeSelect(i)}` to each `SchemeCard`.

## 5. `src/components/SchemeCard.tsx`
Add `isActive` and `onSelect` props. Outer div gets `onClick={onSelect}`, `cursor-pointer`, conditional `border-primary`/`border-border`.

## Scope lock
No layout, thumbnail, toast, backend, or repaint submission changes.

