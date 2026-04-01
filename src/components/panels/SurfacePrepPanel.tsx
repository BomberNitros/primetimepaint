import { SprayViabilityBadge } from '@/components/SprayViabilityBadge';
import { ToggleOption } from '@/components/ToggleOption';

interface SurfacePrepPanelProps {
  currentTemp: number | null;
  manualTempInput: number | null;
  sprayOverride: boolean;
  geoFailed: boolean;
  onManualTempChange: (v: number | null) => void;
  onSprayOverrideChange: (v: boolean) => void;
}

export function SurfacePrepPanel({
  currentTemp,
  manualTempInput,
  sprayOverride,
  onManualTempChange,
  onSprayOverrideChange,
}: SurfacePrepPanelProps) {
  // TODO: Replace with Open-Meteo integration in Phase 3
  const isAbove15 = currentTemp !== null && currentTemp > 15;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Surface Preparation</h2>
        <p className="text-sm text-muted-foreground">Check conditions before priming.</p>
      </div>

      {/* Static temperature input — TODO: replace with Open-Meteo in Phase 3 */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Current temperature (°C)</label>
        <input
          type="number"
          value={manualTempInput ?? ''}
          onChange={(e) => {
            const v = e.target.value === '' ? null : Number(e.target.value);
            onManualTempChange(v);
          }}
          placeholder="Enter temperature..."
          className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <SprayViabilityBadge temp={currentTemp} override={sprayOverride} />

      {currentTemp !== null && !isAbove15 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-warning">
            Spray priming is not recommended below 15°C. Paint may not cure properly and can cause texture issues.
          </p>
        </div>
      )}

      <ToggleOption
        label="Override spray warning"
        description="Dismiss the warning if you know your conditions are fine"
        checked={sprayOverride}
        onChange={onSprayOverrideChange}
      />

      <div className="space-y-2 p-4 rounded-xl bg-card border border-border">
        <h3 className="text-sm font-medium text-foreground">Prep checklist</h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Remove mould lines with a hobby knife</li>
          <li>• Wash resin/metal miniatures in warm soapy water</li>
          <li>• Ensure parts are dry before priming</li>
          <li>• Subassemble complex models if needed</li>
        </ul>
      </div>
    </div>
  );
}
