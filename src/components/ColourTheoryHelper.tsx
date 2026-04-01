// Colour theory helpers — compute complement, split-complement, triad from a hex colour

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getComplement(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex((h + 180) % 360, s, l);
}

export function getSplitComplement(hex: string): [string, string] {
  const [h, s, l] = hexToHsl(hex);
  return [
    hslToHex((h + 150) % 360, s, l),
    hslToHex((h + 210) % 360, s, l),
  ];
}

export function getTriad(hex: string): [string, string] {
  const [h, s, l] = hexToHsl(hex);
  return [
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
  ];
}

interface ColourTheoryHelperProps {
  baseHex: string;
}

export function ColourTheoryHelper({ baseHex }: ColourTheoryHelperProps) {
  const complement = getComplement(baseHex);
  const splitComp = getSplitComplement(baseHex);
  const triad = getTriad(baseHex);

  const groups = [
    { label: 'Complement', colors: [complement] },
    { label: 'Split Complement', colors: splitComp },
    { label: 'Triad', colors: triad },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colour Theory</h4>
      {groups.map(g => (
        <div key={g.label} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{g.label}</span>
          <div className="w-5 h-5 rounded-sm border border-border flex-shrink-0" style={{ backgroundColor: baseHex }} />
          <span className="text-muted-foreground/40">→</span>
          {g.colors.map((c, i) => (
            <div key={i} className="w-5 h-5 rounded-sm border border-border flex-shrink-0" style={{ backgroundColor: c }} />
          ))}
        </div>
      ))}
    </div>
  );
}
