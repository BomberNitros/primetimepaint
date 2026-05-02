# Mobile-only collapsible sidebar

Make `ControlRail` hidden by default on mobile (<768px), toggled via a fixed icon button. Desktop behavior unchanged.

## Files
- `src/components/ControlRail.tsx`
- `src/pages/Index.tsx`

## src/components/ControlRail.tsx

1. Add `X` to the existing `lucide-react` import.
2. Extend `ControlRailProps`:
   ```ts
   isOpen?: boolean;
   onClose?: () => void;
   ```
3. In the function signature, default them: `isOpen = true`, `onClose = () => {}`.
4. Replace the root `<nav>` classes so it behaves responsively:
   - Mobile (default): `fixed inset-y-0 right-0 z-40 w-72 bg-background shadow-xl overflow-y-auto`
   - Desktop reset: `md:relative md:inset-auto md:z-auto md:w-[168px] md:shadow-none`
   - Keep existing `bg-sidebar border-r border-sidebar-border flex flex-col h-full min-w-[168px]` (preserved for desktop).
   - Wrap the entire `<nav>` render in `{(isOpen || /* desktop */ true) && ...}` — simpler: render the nav always, but on mobile hide via class when `!isOpen`. Use conditional class: when `!isOpen`, add `hidden md:flex` (or similar) so it disappears on mobile but stays on desktop.
5. Add an `X` close button as the first child of the `<nav>`, visible only on mobile (`md:hidden`), positioned top-right, calling `onClose`.

Approach for visibility: render `<nav>` with class
`cn('... existing classes ...', !isOpen && 'hidden md:flex')`
so on mobile it's hidden when closed; on md+ it's always shown.

## src/pages/Index.tsx

1. Add import: `import { SlidersHorizontal } from 'lucide-react';` and `Button` from `@/components/ui/button` (verify if already imported; if not, add).
2. Add `const [sidebarOpen, setSidebarOpen] = useState(false);`.
3. Pass `isOpen={sidebarOpen}` and `onClose={() => setSidebarOpen(false)}` to the existing `<ControlRail />`.
4. Add a backdrop element rendered when `sidebarOpen`:
   ```tsx
   {sidebarOpen && (
     <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
   )}
   ```
5. Add a fixed toggle button (mobile only):
   ```tsx
   <Button
     size="icon"
     variant="secondary"
     onClick={() => setSidebarOpen(v => !v)}
     className="fixed bottom-20 right-4 z-50 md:hidden rounded-full"
   >
     <SlidersHorizontal />
   </Button>
   ```

## Notes / minor ambiguities
- The spec says "default true" for `isOpen` in ControlRail, which makes desktop-without-prop callers still work. Combined with the `md:flex` class reset, desktop is unchanged.
- No animation, no new libraries.
- No other files touched.
