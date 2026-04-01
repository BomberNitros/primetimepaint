import { ToggleOption } from '@/components/ToggleOption';
import { PrimeColor, ZenithalScheme, ZenithalMethod, ZenithalDirection } from '@/types/primetime';
import { cn } from '@/lib/utils';

interface PrimingZenithalPanelProps {
  primeColor: PrimeColor;
  zenithalEnabled: boolean;
  zenithalScheme: ZenithalScheme;
  zenithalMethod: ZenithalMethod;
  zenithalDirection: ZenithalDirection;
  onPrimeColorChange: (v: PrimeColor) => void;
  onZenithalEnabledChange: (v: boolean) => void;
  onZenithalSchemeChange: (v: ZenithalScheme) => void;
  onZenithalMethodChange: (v: ZenithalMethod) => void;
  onZenithalDirectionChange: (v: ZenithalDirection) => void;
}

function OptionButtons<T extends string>({
  label,
  options,
  value,
  onChange,
}: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-2">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              value === o.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PrimingZenithalPanel({
  primeColor, zenithalEnabled, zenithalScheme, zenithalMethod, zenithalDirection,
  onPrimeColorChange, onZenithalEnabledChange, onZenithalSchemeChange,
  onZenithalMethodChange, onZenithalDirectionChange,
}: PrimingZenithalPanelProps) {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Priming & Zenithal</h2>
        <p className="text-sm text-muted-foreground">Set up your undercoat strategy.</p>
      </div>

      <OptionButtons
        label="Prime colour"
        options={[{ value: 'black' as PrimeColor, label: 'Black' }, { value: 'white' as PrimeColor, label: 'White' }]}
        value={primeColor}
        onChange={onPrimeColorChange}
      />

      <ToggleOption
        label="Zenithal highlight"
        description="Apply a directional highlight over the prime coat"
        checked={zenithalEnabled}
        onChange={onZenithalEnabledChange}
      />

      {zenithalEnabled && (
        <>
          <OptionButtons
            label="Zenithal scheme"
            options={[
              { value: '2tone' as ZenithalScheme, label: '2-Tone' },
              { value: '3tone' as ZenithalScheme, label: '3-Tone' },
            ]}
            value={zenithalScheme}
            onChange={onZenithalSchemeChange}
          />

          <OptionButtons
            label="Application method"
            options={[
              { value: 'drybrush' as ZenithalMethod, label: 'Drybrush' },
              { value: 'spray' as ZenithalMethod, label: 'Spray / Airbrush' },
            ]}
            value={zenithalMethod}
            onChange={onZenithalMethodChange}
          />

          <OptionButtons
            label="Light direction"
            options={[
              { value: 'top-left' as ZenithalDirection, label: '↖ Top-Left' },
              { value: 'top' as ZenithalDirection, label: '↑ Top' },
              { value: 'top-right' as ZenithalDirection, label: '↗ Top-Right' },
            ]}
            value={zenithalDirection}
            onChange={onZenithalDirectionChange}
          />

          {zenithalMethod === 'spray' && (
            <div className="p-3 rounded-lg bg-card border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Spray reminder:</span> Short bursts, 15–20cm distance, keep the can moving. Shake for 2+ minutes before use.
              </p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              The zenithal direction influences how the colour preview reads — brighter on the lit side, deeper shadows on the opposite side.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
