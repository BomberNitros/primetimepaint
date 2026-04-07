import { useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MiniatureDetails {
  name: string; setName: (v: string) => void;
  origin: string; setOrigin: (v: string) => void;
  manufacturer: string; setManufacturer: (v: string) => void;
  role: string; setRole: (v: string) => void;
  customRole: string; setCustomRole: (v: string) => void;
}

interface PaintDirectivePanelProps {
  assembledPrompt: string;
  miniature: MiniatureDetails;
}

export function PaintDirectivePanel({
  assembledPrompt,
  miniature,
}: PaintDirectivePanelProps) {
  const [open, setOpen] = useState(false);

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
          {/* Left column — read-only prompt */}
          <div
            className="w-full min-h-[160px] text-xs font-mono p-2 rounded border border-border bg-muted/30 whitespace-pre-wrap break-words overflow-y-auto"
          >
            {assembledPrompt || 'No prompt assembled yet.'}
          </div>

          {/* Right column — miniature details */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground">
              Miniature details
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <input
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={miniature.name}
                  onChange={e => miniature.setName(e.target.value)}
                  placeholder="e.g. Nagash"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Origin</label>
                <input
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={miniature.origin}
                  onChange={e => miniature.setOrigin(e.target.value)}
                  placeholder="e.g. Age of Sigmar"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Manufacturer</label>
                <input
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={miniature.manufacturer}
                  onChange={e => miniature.setManufacturer(e.target.value)}
                  placeholder="e.g. Games Workshop"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Role</label>
                <select
                  className="w-full text-xs p-1.5 rounded border border-border bg-background mt-1"
                  value={miniature.role}
                  onChange={e => miniature.setRole(e.target.value)}
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

            {miniature.role === 'other' && (
              <input
                className="w-full text-xs p-1.5 rounded border border-border bg-background"
                value={miniature.customRole}
                onChange={e => miniature.setCustomRole(e.target.value)}
                placeholder="Describe role…"
              />
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
