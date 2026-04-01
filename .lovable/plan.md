

# Plan Update — Two Technical Lock-Ins

## 1. Export Background: Explicit Offscreen Canvas Composite

Before writing the PNG, the export function must:

1. Create an offscreen canvas at the same dimensions as the `RecolorPreview` output
2. Fill it with `#808080` (mid-grey)
3. `drawImage` the `RecolorPreview` canvas onto it
4. Call `toDataURL('image/png')` on the offscreen canvas

`html2canvas` is used only to capture the preview canvas element — the neutral background is composited programmatically, never inherited from CSS or DOM styling. This eliminates environment-dependent capture bugs.

## 2. Zenithal Directional Modifier: Frozen Definition

**Definition (one sentence):**

> For each foreground pixel, compute a directional bias value `b` as `intensity * cos(angle_to_light_source)` where `intensity` is a fixed constant (default 30), then add `b` to the pixel's raw luminance before zone classification, clamping the result to 0–255.

- `angle_to_light_source` is the angle between the pixel's position vector (from image center) and the light direction vector (`top` = 90°, `top-left` = 135°, `top-right` = 45°)
- `intensity = 30` is a hardcoded constant in v1 — not user-adjustable
- The bias is applied once, before the 4-zone threshold check, inside the single recolor pass
- No second pass, no post-effect, no blur, no gradient overlay

This is the complete Zenithal v1 spec. Any change to this formula requires an explicit plan revision.

## Sections affected in plan

- Phase 3 RecolorPreview implementation notes: add offscreen canvas export requirement
- Phase 3 RecolorPreview implementation notes: add frozen Zenithal formula
- Phase 4 export line item: reference offscreen composite, not CSS background

