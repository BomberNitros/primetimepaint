

# Plan: Recolour preview display — Quick Preview + AI Recolour slot

## What changes

The `RecolorPreview` component's render output gets restructured into a two-panel layout: the existing canvas result (relabelled "Quick preview") and a new static AI placeholder slot.

## File: `src/components/RecolorPreview.tsx`

### Changes to the rendered JSX (lines 206–221)

**No-image state** (line 206–211): unchanged.

**Has-image state** (lines 214–220): replace with a 2-column grid layout:

**Left panel — Quick preview:**
- Dashed neutral border (`border-dashed border-border`), rounded card
- Label: `<h4>` "Quick preview" in muted small text
- Subtitle line: `<Timer>` icon (Lucide) + "Colour approximation — AI recolour in progress" in `text-muted-foreground text-xs`
- The existing `<canvas>` inside
- Existing italic disclaimer kept below the canvas

**Right panel — AI recolour (always STATE A for now):**
- Same card dimensions, solid subtle border (`border-border`)
- Background: `bg-muted/30` (slightly offset)
- Centred content:
  - `<Sparkles>` icon (Lucide), muted colour, 32px
  - Label: "AI recolour" in small semibold text
  - Message: "Connect Gemini to enable high-quality AI repainting" in `text-xs text-muted-foreground`
  - Secondary button: "Add API key" (`variant="secondary" size="sm"`) — no-op onClick for now

**Grid:** `grid grid-cols-1 md:grid-cols-2 gap-4` — stacked on mobile, side by side on desktop. Both panels use `aspect-auto` but min-height matched via flexbox.

### Imports to add
- `Clock` or `Timer` from `lucide-react`
- `Sparkles` from `lucide-react`
- `Button` from `@/components/ui/button`
- `Skeleton` from `@/components/ui/skeleton` (present for future STATE B, not rendered yet)

### Not changed
- All processing logic (lines 1–200) untouched
- No changes to props, `forwardRef`, or canvas processing
- No API calls added
- No changes to ColorPlanPanel, ImageSlider, or any other component
- `renderStrategy` prop kept as the future AI hook — no logic wired to it

## Files changed

| File | Change |
|---|---|
| `src/components/RecolorPreview.tsx` | Restructure render output only |

