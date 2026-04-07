

# Refactor `generateSchemes` — strict three-scheme separation

One file: `src/pages/Index.tsx`.

## Current problem

`getBase`/`getMid1`/`getMid2`/`getHigh` all check overrides, so Scheme 1 (supposed baseline) is contaminated by user overrides. Scheme 2 also conditionally skips theme shift when overrides are set. Scheme 3 is an unrelated "mix approach" rather than an override variation.

## Changes (lines 50–134)

### Pure baseline mappers (lines 78–101)

Strip all override logic from `getBase`, `getMid1`, `getMid2`, `getHigh`. They become simple extracted-colour-to-closest-paint mappers:

```ts
const getBase = () => extractedColors[0] ? closestPaint(extractedColors[0]) : paints[8];
const getMid1 = () => extractedColors[1] ? closestPaint(extractedColors[1]) : paints[7];
const getMid2 = () => extractedColors[2] ? closestPaint(extractedColors[2]) : null;
const getHigh = () => extractedColors[3] ? closestPaint(extractedColors[3]) : paints[23];
```

### Scheme 1 — Baseline (lines 103–110)

Rename to `"Baseline"`. Uses pure `getBase`/`getMid1`/`getMid2`/`getHigh`. No changes needed beyond the name.

### Scheme 2 — Theme variation (lines 112–123)

Remove all override guards. Apply `themeShift` unconditionally to all four roles from Scheme 1:

```ts
const s2: ColorScheme = {
  name: "Theme variation",
  base: paints[(paints.indexOf(s1.base) + themeShift) % paints.length],
  midtone1: paints[(paints.indexOf(s1.midtone1) + themeShift + 2) % paints.length],
  midtone2: s1.midtone2 ? paints[(paints.indexOf(s1.midtone2) + themeShift + 4) % paints.length] : null,
  highlight: paints[(paints.indexOf(s1.highlight) + themeShift + 1) % paints.length],
};
```

### Scheme 3 — Override variation (lines 125–132)

Replace the "mix approach" with override application on top of Scheme 2:

```ts
const s3: ColorScheme = {
  name: "Override variation",
  type: "speedpaint-led",
  base: baseOverride ? (paints.find(p => p.name === baseOverride) || s2.base) : s2.base,
  midtone1: midtoneOverrides[0] ? (paints.find(p => p.name === midtoneOverrides[0]) || s2.midtone1) : s2.midtone1,
  midtone2: midtoneOverrides[1] ? (paints.find(p => p.name === midtoneOverrides[1]) || s2.midtone2) : s2.midtone2,
  highlight: highlightOverride ? (paints.find(p => p.name === highlightOverride) || s2.highlight) : s2.highlight,
};
```

### Function signature

Unchanged — still accepts `(extractedColors, theme, baseOverride, midtoneOverrides, highlightOverride)`. The overrides are only consumed in Scheme 3 now.

## No other changes

- Call site (line 284) unchanged
- `assembledPrompt`, preview colours, layout — all untouched in this prompt

