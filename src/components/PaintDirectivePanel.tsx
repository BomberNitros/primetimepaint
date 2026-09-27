interface MiniatureDetails {
  name: string; setName: (v: string) => void;
  origin: string; setOrigin: (v: string) => void;
  manufacturer: string; setManufacturer: (v: string) => void;
  role: string; setRole: (v: string) => void;
  customRole: string; setCustomRole: (v: string) => void;
}

interface PaintDirectivePanelProps {
  miniature: MiniatureDetails;
}

export function PaintDirectivePanel({
  miniature,
}: PaintDirectivePanelProps) {
  return (
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
  );
}
