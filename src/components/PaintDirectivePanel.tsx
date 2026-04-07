import React, { useState, useRef } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const lastTick = useRef(0);
  const [tick, setTick] = useState(0);

  React.useEffect(() => {
    if (tick === 0 || tick === lastTick.current) return;
    lastTick.current = tick;

    const snap = {
      prompt: activePrompt,
      name, origin, manufacturer, role, customRole,
      zenithalEnabled, primeColor,
    };

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

    const roleInstruction =
      snap.role === 'other'
        ? (snap.customRole || null)
        : (roleMap[snap.role] ??
            (snap.role
              ? 'Standard centrepiece treatment.'
              : null));

    const primerInstruction = snap.zenithalEnabled
      ? 'Zenithal gradient present — light from directly above, shadow below. Preserve it. Work with it, do not flatten it.'
      : snap.primeColor === 'white'
        ? 'White primer. Surface reads bright. Push shadows hard into recesses to create depth.'
        : snap.primeColor === 'black'
          ? 'Black primer. Surface reads dark. Highlights on raised upper surfaces must be strong and deliberate. Let recesses stay near-black.'
          : 'Neutral grey primer. Build shading from scratch — light from 45° above. Highlights on upper/forward surfaces, shadow on underside.';

    let result = snap.prompt ?? '';

    result = snap.name
      ? result.replace(/\{\{SUBJECT_NAME\}\}/g, snap.name)
      : result.replace(/\{\{SUBJECT_NAME\}\}/g, '');

    result = snap.origin
      ? result.replace(/\{\{ORIGIN_CLAUSE\}\}/g, ` from ${snap.origin}`)
      : result.replace(/\{\{ORIGIN_CLAUSE\}\}/g, '');

    result = snap.manufacturer
      ? result.replace(/\{\{MANUFACTURER_REF\}\}/g, `Manufactured by ${snap.manufacturer}.`)
      : result.replace(/\{\{MANUFACTURER_REF\}\}/g, '');

    result = roleInstruction
      ? result.replace(/\{\{ROLE_INSTRUCTION\}\}/g, roleInstruction)
      : result.replace(/\{\{ROLE_INSTRUCTION\}\}/g, '');

    result = result.replace(
      /\{\{PRIMER_SHADING_INSTRUCTION\}\}/g,
      primerInstruction
    );

    onPromptChange(result);
  }, [tick]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          Paint directive
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid grid-cols-2 gap-4 pt-3">
          {/* Left column — textarea */}
          <div>
            <textarea
              className="w-full min-h-[220px] text-xs font-mono p-2 rounded border border-border bg-background resize-y"
              value={activePrompt ?? ''}
              onChange={e => onPromptChange(e.target.value)}
            />
          </div>

          {/* Right column — miniature details & actions */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground">
              Miniature details
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <input
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Nagash"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Origin</label>
                <input
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Age of Sigmar"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Manufacturer</label>
                <input
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={manufacturer}
                  onChange={e => setManufacturer(e.target.value)}
                  placeholder="e.g. Games Workshop"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Role</label>
                <select
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="">— select —</option>
                  <option>Boss / Major Enemy</option>
                  <option>Hero / Champion</option>
                  <option>Villain / Antagonist</option>
                  <option>Monster / Creature</option>
                  <option>Daemon / Otherworldly Entity</option>
                  <option>Undead / Construct</option>
                  <option>Vehicle / War Machine</option>
                  <option>Terrain / Structure</option>
                  <option>Infantry / Foot Soldier</option>
                  <option>Swarm / Horde Unit</option>
                  <option value="other">Other…</option>
                </select>
              </div>
            </div>

            {role === 'other' && (
              <input
                className="w-full text-xs p-1.5 rounded border border-border bg-background"
                value={customRole}
                onChange={e => setCustomRole(e.target.value)}
                placeholder="Describe role…"
              />
            )}

            <button
              type="button"
              className="w-full py-2 text-xs font-medium rounded border border-border hover:bg-muted/40 transition-colors"
              onClick={() => setTick(t => t + 1)}
            >
              Inject into prompt
            </button>

            <button
              type="button"
              className="w-full py-2 text-xs font-medium rounded border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              onClick={onSubmit}
              disabled={currentlyRepainting || !activePrompt}
            >
              {currentlyRepainting ? 'Repainting…' : 'Submit to Gemini'}
            </button>

            {submitError && (
              <p className="text-xs text-destructive">{submitError}</p>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
