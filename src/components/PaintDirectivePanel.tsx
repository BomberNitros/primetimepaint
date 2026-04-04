import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { randomFont } from '@/components/ControlRail';

const ROLE_OPTIONS = [
  { value: '', label: 'Select a role' },
  { value: 'Infantry / Foot Soldier', label: 'Infantry / Foot Soldier' },
  { value: 'Hero / Champion', label: 'Hero / Champion' },
  { value: 'Boss / Major Enemy', label: 'Boss / Major Enemy' },
  { value: 'Monster / Creature', label: 'Monster / Creature' },
  { value: 'Villain / Antagonist', label: 'Villain / Antagonist' },
  { value: 'Vehicle / War Machine', label: 'Vehicle / War Machine' },
  { value: 'Terrain / Structure', label: 'Terrain / Structure' },
  { value: 'Companion / Familiar', label: 'Companion / Familiar' },
  { value: 'Mounted / Cavalry', label: 'Mounted / Cavalry' },
  { value: 'Mage / Psyker / Caster', label: 'Mage / Psyker / Caster' },
  { value: 'Undead / Construct', label: 'Undead / Construct' },
  { value: 'Daemon / Otherworldly Entity', label: 'Daemon / Otherworldly Entity' },
  { value: 'Beast / Animal', label: 'Beast / Animal' },
  { value: 'Leader / Commander', label: 'Leader / Commander' },
  { value: 'Swarm / Horde Unit', label: 'Swarm / Horde Unit' },
  { value: 'other', label: 'Something else →' },
];

interface PaintDirectivePanelProps {
  activePrompt: string | null;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
  currentlyRepainting: boolean;
  submitError: string | null;
  zenithalEnabled: boolean;
  primeColor: string;
}

export function PaintDirectivePanel({
  activePrompt,
  onPromptChange,
  onSubmit,
  currentlyRepainting,
  submitError,
  zenithalEnabled,
  primeColor,
}: PaintDirectivePanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [injectTick, setInjectTick] = useState(0);
  const lastProcessedTick = useRef(0);

  useEffect(() => {
    if (bodyRef.current) {
      setBodyHeight(bodyRef.current.scrollHeight);
    }
  }, [isOpen, activePrompt, name, origin, role, customRole, manufacturer]);

  // Injection useEffect
  useEffect(() => {
    if (injectTick === 0 || injectTick === lastProcessedTick.current) return;
    lastProcessedTick.current = injectTick;

    let result = activePrompt ?? '';

    const roleMap: Record<string, string> = {
      'Boss / Major Enemy':
        'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
      'Hero / Champion':
        'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
      'Villain / Antagonist':
        'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
      'Monster / Creature':
        'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
      'Daemon / Otherworldly Entity':
        'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
      'Undead / Construct':
        'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
      'Vehicle / War Machine':
        'Hard surface priority. Panel shading, wear and weathering appropriate.',
      'Terrain / Structure':
        'Hard surface priority. Panel shading, wear and weathering appropriate.',
      'Infantry / Foot Soldier':
        'Tabletop standard. Efficient coverage, clear contrast, unit-consistent aesthetic.',
      'Swarm / Horde Unit':
        'Tabletop standard. Efficient coverage, clear contrast, unit-consistent aesthetic.',
    };

    const roleInstruction = role === 'other'
      ? (customRole || null)
      : (roleMap[role] ?? (role ? 'Standard centrepiece treatment.' : null));

    const primerInstruction = zenithalEnabled
      ? 'Zenithal gradient present — light from directly above, shadow below. Preserve it. Work with it, do not flatten it.'
      : primeColor === 'white'
        ? 'White primer. Surface reads bright. Push shadows hard into recesses to create depth.'
        : primeColor === 'black'
          ? 'Black primer. Surface reads dark. Highlights on raised upper surfaces must be strong and deliberate. Let recesses stay near-black.'
          : 'Neutral grey primer. Build shading from scratch — light from 45° above. Highlights on upper/forward surfaces, shadow on underside.';

    result = name
      ? result.replace(/\{\{SUBJECT_NAME\}\}/g, name)
      : result.replace(/\{\{SUBJECT_NAME\}\}/g, '');

    result = origin
      ? result.replace(/\{\{ORIGIN_CLAUSE\}\}/g, ` from ${origin}`)
      : result.replace(/\{\{ORIGIN_CLAUSE\}\}/g, '');

    result = manufacturer
      ? result.replace(/\{\{MANUFACTURER_REF\}\}/g, `Manufactured by ${manufacturer}.`)
      : result.replace(/\{\{MANUFACTURER_REF\}\}/g, '');

    result = roleInstruction
      ? result.replace(/\{\{ROLE_INSTRUCTION\}\}/g, roleInstruction)
      : result.replace(/\{\{ROLE_INSTRUCTION\}\}/g, '');

    result = result.replace(
      /\{\{PRIMER_SHADING_INSTRUCTION\}\}/g,
      primerInstruction
    );

    onPromptChange(result);
  }, [injectTick, activePrompt, name, origin, manufacturer, role, customRole, zenithalEnabled, primeColor]);

  const condition = zenithalEnabled
    ? 'Zenithal'
    : primeColor === 'white' ? 'Primed — white'
    : primeColor === 'black' ? 'Primed — black'
    : 'Primed — neutral grey';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-card/80 transition-colors"
      >
        <span
          className="text-base font-normal"
          style={{ fontFamily: `'${randomFont}', sans-serif` }}
        >
          Paint Directive
        </span>
        <span className="text-xs text-muted-foreground">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      <div
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? `${bodyHeight ?? 9999}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 200ms ease',
        }}
      >
        <div className="px-4 pb-4 space-y-4">
          <textarea
            value={activePrompt ?? ''}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            placeholder="Prompt will appear after pipeline analysis..."
          />

          {/* Miniature details */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Miniature details</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eye of Cthulhu"
                className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Terraria"
                className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="space-y-1">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {ROLE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {role === 'other' && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Describe the character's role"
                    className="w-full px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )}
              </div>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Games Workshop, Printomancer3D"
                className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-muted rounded-md text-xs opacity-70 pointer-events-none">
                {condition}
              </span>
              <Button
                type="button"
                onClick={() => {
                  let result = activePrompt ?? '';

                  const roleMap: Record<string, string> = {
                    'Boss / Major Enemy':
                      'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
                    'Hero / Champion':
                      'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
                    'Villain / Antagonist':
                      'Treat as a centrepiece. Maximum detail, strong contrast, showcase-level shading.',
                    'Monster / Creature':
                      'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
                    'Daemon / Otherworldly Entity':
                      'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
                    'Undead / Construct':
                      'Organic emphasis. Wet textures, deep recesses, biological colour variation.',
                    'Vehicle / War Machine':
                      'Hard surface priority. Panel shading, wear and weathering appropriate.',
                    'Terrain / Structure':
                      'Hard surface priority. Panel shading, wear and weathering appropriate.',
                    'Infantry / Foot Soldier':
                      'Tabletop standard. Efficient coverage, clear contrast, unit-consistent aesthetic.',
                    'Swarm / Horde Unit':
                      'Tabletop standard. Efficient coverage, clear contrast, unit-consistent aesthetic.',
                  };

                  const roleInstruction = role === 'other'
                    ? (customRole || null)
                    : (roleMap[role] ?? (role ? 'Standard centrepiece treatment.' : null));

                  const primerInstruction = zenithalEnabled
                    ? 'Zenithal gradient present — light from directly above, shadow below. Preserve it. Work with it, do not flatten it.'
                    : primeColor === 'white'
                      ? 'White primer. Surface reads bright. Push shadows hard into recesses to create depth.'
                      : primeColor === 'black'
                        ? 'Black primer. Surface reads dark. Highlights on raised upper surfaces must be strong and deliberate. Let recesses stay near-black.'
                        : 'Neutral grey primer. Build shading from scratch — light from 45° above. Highlights on upper/forward surfaces, shadow on underside.';

                  result = name
                    ? result.replace(/\{\{SUBJECT_NAME\}\}/g, name)
                    : result.replace(/\{\{SUBJECT_NAME\}\}/g, '');

                  result = origin
                    ? result.replace(/\{\{ORIGIN_CLAUSE\}\}/g, ` from ${origin}`)
                    : result.replace(/\{\{ORIGIN_CLAUSE\}\}/g, '');

                  result = manufacturer
                    ? result.replace(/\{\{MANUFACTURER_REF\}\}/g, `Manufactured by ${manufacturer}.`)
                    : result.replace(/\{\{MANUFACTURER_REF\}\}/g, '');

                  result = roleInstruction
                    ? result.replace(/\{\{ROLE_INSTRUCTION\}\}/g, roleInstruction)
                    : result.replace(/\{\{ROLE_INSTRUCTION\}\}/g, '');

                  result = result.replace(
                    /\{\{PRIMER_SHADING_INSTRUCTION\}\}/g,
                    primerInstruction
                  );

                  onPromptChange(result);
                }}
                disabled={!activePrompt}
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <Syringe className="w-3.5 h-3.5" />
                Inject into prompt
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onSubmit}
              disabled={currentlyRepainting || !activePrompt}
              size="sm"
              className="gap-1.5"
            >
              {currentlyRepainting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit to Gemini
            </Button>
            <span className="text-xs text-muted-foreground">
              Repaint · €0.04
            </span>
          </div>

          {submitError && (
            <p className="text-xs text-destructive">{submitError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
