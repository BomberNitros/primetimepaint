# Restyle the lightbox Download button

## Change
In `src/components/BottomBar.tsx` (line 225), the "Download" button inside the `zoomedIndex` lightbox currently uses:

```
bg-primary text-primary-foreground text-sm font-medium rounded-md px-4 py-2 hover:bg-primary/90 transition-colors
```

Change it to:

```
bg-secondary text-xs text-muted-foreground rounded-md px-3 py-1.5 hover:text-foreground transition-colors
```

Nothing else changes: the lightbox layout, image, close button, and all other files stay untouched.

## Result
The zoom-mode Download button matches the styling of the existing "Download Repaints" and "Clear uploads" buttons (small, muted text on a secondary chip, brightening on hover).
