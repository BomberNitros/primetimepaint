/**
 * Gemini pipeline — anatomy analysis, repaint generation, and custom repaint.
 * All calls go through supabase.functions.invoke('gemini-repaint').
 */

import { supabase } from '@/integrations/supabase/client';
import { AnatomyRegion, ColorScheme, PrimeColor, ZenithalScheme, ZenithalMethod, ZenithalDirection } from '@/types/primetime';

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyseAnatomy(
  imageBase64: string,
  referenceImages?: string[]
): Promise<AnatomyRegion[]> {
  const { data, error } = await supabase.functions.invoke('gemini-repaint', {
    body: { type: 'anatomy', image: imageBase64, referenceImages },
  });

  if (error) throw new Error(error.message ?? 'Anatomy analysis failed.');
  if (data?.error) throw new Error(data.error);

  const regions: AnatomyRegion[] = data.regions;

  // Development diagnostic: warn if any region looks like primer/background
  regions.forEach(r => {
    const hex = r.baseColor.hex.replace('#', '');
    const rV = parseInt(hex.slice(0, 2), 16) / 255;
    const gV = parseInt(hex.slice(2, 4), 16) / 255;
    const bV = parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(rV, gV, bV);
    const min = Math.min(rV, gV, bV);
    const l = (max + min) / 2;
    const s = max === min ? 0 : l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    if (s < 0.1 && (l < 0.15 || l > 0.90)) {
      console.warn(
        `[Primetime] Region "${r.region}" baseColor ${r.baseColor.hex} may be primer/background. Saturation: ${(s * 100).toFixed(1)}%, Lightness: ${(l * 100).toFixed(1)}%`
      );
    }
  });

  return regions;
}

export async function generateRepaint(
  imageBase64: string,
  regions: AnatomyRegion[],
  subjectName: string,
  referenceImages?: string[]
): Promise<{ image: string; prompt: string }> {
  const regionBlock = regions.map(r =>
    `${r.region}\n  Base: ${r.baseColor.name} (${r.baseColor.hex})\n  Shadow: ${r.shadowColor.name} (${r.shadowColor.hex})\n  Highlight: ${r.highlightColor.name} (${r.highlightColor.hex})\n  Treatment: ${r.surfaceNote}`
  ).join('\n\n');

  const constructedPrompt = `You are digitally repainting a physical tabletop miniature. The subject is ${subjectName}.
It is primed in neutral grey.

---
ANATOMY — repaint each region as described:

${regionBlock}

---
COLOR SCHEME:
{{COLOR_SCHEME_BLOCK}}
---

PAINTING STYLE:
- Hand-painted tabletop miniature. Not a render. Not a digital illustration.
- Acrylic paint texture subtly visible. No airbrushed smoothness.

DO NOT:
- Add, remove, or reshape any sculpted surface features.
- Repaint the base, groundwork, or scenic elements.
- Add backgrounds, glow, bloom, lens flare, or atmospheric effects.
- Change the photo angle or framing.

OUTPUT: Same photo angle and framing as input. Miniature repainted as described above.`;

  // Token guard: replace {{COLOR_SCHEME_BLOCK}} before sending
  const initialSchemeBlock = regions.map(r =>
    `${r.region}: base ${r.baseColor.name} (${r.baseColor.hex}), shadow ${r.shadowColor.name} (${r.shadowColor.hex}), highlight ${r.highlightColor.name} (${r.highlightColor.hex})`
  ).join('\n');

  const promptToSend = constructedPrompt.replace(
    /\{\{COLOR_SCHEME_BLOCK\}\}/g,
    initialSchemeBlock
  );
  console.log('[pipeline] referenceImages count:', referenceImages?.length ?? 0);
  console.log('[pipeline] promptToSend preview:', promptToSend.slice(0, 200));

  const { data, error } = await supabase.functions.invoke('gemini-repaint', {
    body: { type: 'repaint', image: imageBase64, prompt: promptToSend, referenceImages },
  });

  if (error) throw new Error(error.message ?? 'Repaint generation failed.');
  if (data?.error) throw new Error(data.error);

  const prefix = 'data:image/png;base64,';
  const image = data.image.startsWith(prefix) ? data.image : `${prefix}${data.image}`;

  // Return constructedPrompt with token intact for later injection
  return { image, prompt: constructedPrompt };
}

function buildPrimingSettingsBlock(
  primeColor: PrimeColor,
  zenithalEnabled: boolean,
  zenithalScheme: ZenithalScheme,
  zenithalMethod: ZenithalMethod,
  zenithalDirection: ZenithalDirection,
): string {
  const base: Record<PrimeColor, string> = {
    black: 'Base coat: black primer. Deepest recesses and shadow areas remain pure black.',
    grey:  'Base coat: neutral grey primer. Mid-tone starting point across all surfaces.',
    white: 'Base coat: white primer. All surfaces start bright; shadows are applied over white.',
  };
  if (!zenithalEnabled) {
    return `${base[primeColor]}\nNo zenithal highlight — flat prime coat only. Uniform value across entire model.`;
  }
  const scheme: Record<ZenithalScheme, string> = {
    flat:    'Zenithal style: flat — minimal graduation, soft even highlight from above.',
    '2tone': 'Zenithal style: two-tone — dark base, lighter highlight from above. Clear separation between lit and shadow.',
    '3tone': 'Zenithal style: three-tone — dark base, mid-grey transition zone, bright near-white highlight on highest points.',
  };
  const method: Record<ZenithalMethod, string> = {
    drybrush: 'Application: drybrushed. Paint texture visible on raised edges, chalky catch on details.',
    spray:    'Application: airbrushed/spray. Smooth gradient transitions, no brush texture.',
  };
  const direction: Record<ZenithalDirection, string> = {
    'top':       'Light direction: directly overhead. Highlights on all upward-facing surfaces equally.',
    'top-left':  'Light direction: top-left. Highlights favour left-facing and upward surfaces; right side darker.',
    'top-right': 'Light direction: top-right. Highlights favour right-facing and upward surfaces; left side darker.',
  };
  return [base[primeColor], scheme[zenithalScheme], method[zenithalMethod], direction[zenithalDirection]].join('\n');
}

export async function generatePrimingRepaint(
  imageBase64: string,
  subjectName: string,
  primeColor: PrimeColor,
  zenithalEnabled: boolean,
  zenithalScheme: ZenithalScheme,
  zenithalMethod: ZenithalMethod,
  zenithalDirection: ZenithalDirection,
  referenceImages?: string[]
): Promise<{ image: string; prompt: string }> {
  const settingsBlock = buildPrimingSettingsBlock(
    primeColor, zenithalEnabled, zenithalScheme, zenithalMethod, zenithalDirection
  );
  const prompt = `You are digitally applying a primer coat to a physical tabletop miniature. The subject is ${subjectName}.

PRIMING SETTINGS:
${settingsBlock}

GENERAL RULES:
- Monochrome only — no colour whatsoever.
- Hand-primed tabletop miniature. Not a render. Not a digital illustration.
- Subtle texture visible matching the application method above.

DO NOT:
- Add, remove, or reshape any sculpted surface features.
- Repaint the base, groundwork, or scenic elements.
- Add backgrounds, glow, bloom, lens flare, or atmospheric effects.
- Change the photo angle or framing.
- Add any colour — this is primer only.

OUTPUT: Same photo angle and framing as input. Miniature with primer applied as described above.`;

  const { data, error } = await supabase.functions.invoke('gemini-repaint', {
    body: { type: 'repaint', image: imageBase64, prompt, referenceImages },
  });
  if (error) throw new Error(error.message ?? 'Priming repaint failed.');
  if (data?.error) throw new Error(data.error);
  const prefix = 'data:image/png;base64,';
  const image = data.image.startsWith(prefix) ? data.image : `${prefix}${data.image}`;
  return { image, prompt };
}

export async function submitCustomRepaint(
  imageBase64: string,
  prompt: string,
  referenceImages?: string[]
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('gemini-repaint', {
    body: { type: 'repaint', image: imageBase64, prompt, referenceImages },
  });

  if (error) throw new Error(error.message ?? 'Custom repaint failed.');
  if (data?.error) throw new Error(data.error);

  const prefix = 'data:image/png;base64,';
  return data.image.startsWith(prefix) ? data.image : `${prefix}${data.image}`;
}

export function buildColorSchemeBlock(
  anatomyRegions: AnatomyRegion[],
  activeScheme: ColorScheme | null,
  baseOverride: string | null,
  midtoneOverrides: string[],
  highlightOverride: string | null
): string {
  if (!anatomyRegions.length && !activeScheme && !baseOverride && !midtoneOverrides.length && !highlightOverride) return '';

  const lines: string[] = [];

  // Layer 1: anatomy defaults
  anatomyRegions.forEach(r => {
    lines.push(
      `${r.region}: base ${r.baseColor.name} (${r.baseColor.hex}), shadow ${r.shadowColor.name} (${r.shadowColor.hex}), highlight ${r.highlightColor.name} (${r.highlightColor.hex})`
    );
  });

  // Layer 2: active scheme values
  if (activeScheme) {
    lines.push('');
    lines.push('Active scheme: ' + activeScheme.name);
    lines.push('  Base: ' + activeScheme.base.name + ' (' + activeScheme.base.hex + ')');
    lines.push('  Midtone 1: ' + activeScheme.midtone1.name + ' (' + activeScheme.midtone1.hex + ')');
    if (activeScheme.midtone2) {
      lines.push('  Midtone 2: ' + activeScheme.midtone2.name + ' (' + activeScheme.midtone2.hex + ')');
    }
    lines.push('  Highlight: ' + activeScheme.highlight.name + ' (' + activeScheme.highlight.hex + ')');
  }

  // Layer 3: overrides — always last, prefixed
  if (baseOverride || midtoneOverrides.length || highlightOverride) {
    lines.push('');
    if (baseOverride) lines.push('OVERRIDE base: ' + baseOverride);
    midtoneOverrides.forEach(m => lines.push('OVERRIDE midtone: ' + m));
    if (highlightOverride) lines.push('OVERRIDE highlight: ' + highlightOverride);
  }

  return lines.join('\n');
}
