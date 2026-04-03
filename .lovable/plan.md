

# Implementation Plan — Approved with Modifications

## Scope
- **Section 1** — Priming panel: badge accent styling, remove zenithal sentence, default zenithal OFF
- **Section 2** — Slider: thumbnail strip (replaces dots), persistent arrows, full-view lightbox
- **Section 3** — Inline gradient styles for app background and primary buttons
- **Section 4** — SKIPPED entirely. No mem:// writes.

## Files to change

| File | Changes |
|---|---|
| `src/components/panels/PrimingZenithalPanel.tsx` | 1a: all badge states use `badgeRightAccent: true`; 1b: remove zenithal clarifying sentence |
| `src/hooks/usePrimetimeState.ts` | 1c: `zenithalEnabled: false` |
| `src/components/ImageSlider.tsx` | 2a: thumbnail strip replaces dots; 2b: always-visible arrows with disabled state; 2c: lightbox via portal |
| `src/pages/Index.tsx` | 3a: inline `backgroundImage` gradient on root div |
| `src/components/ui/button.tsx` | 3b: inline gradient style for default variant with hover handler |
| `src/index.css` | 3a+3b: remove `.primetime-app-bg` and `.primetime-btn-primary` CSS rules |

## Key details

**Section 1** — Three small targeted edits. Badge accent fix ensures "Unprimed", "Processing", and "Primed · X" all render with the same accent pill. Zenithal sentence deletion is a single JSX removal. Default state change is one line in the initial state object.

**Section 2** — Thumbnail strip: 64×48px covers with accent border on active, 50% opacity on inactive, horizontal scroll overflow. Arrows: always rendered, 30% opacity + `pointer-events-none` at boundaries. Lightbox: `createPortal` to `document.body`, fixed overlay, keyboard nav via `useEffect`, close on backdrop/Escape/X button.

**Section 3** — Inline `style` props override any conflicting Tailwind classes. Button component adds `isHovered` state and `onMouseEnter`/`onMouseLeave` for gradient swap, scoped to `variant === 'default'` only. Unused CSS classes removed from `index.css`.

