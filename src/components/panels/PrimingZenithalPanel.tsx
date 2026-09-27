import { ToggleOption } from '@/components/ToggleOption';
import { SprayViabilityBadge } from '@/components/SprayViabilityBadge';
import { ImageSlider, SliderImage } from '@/components/ImageSlider';
import { DualSlider } from '@/components/DualSlider';
import { PaintDirectivePanel } from '@/components/PaintDirectivePanel';
import { PrimeColor, ZenithalScheme, ZenithalMethod, ZenithalDirection, UploadedImage } from '@/types/primetime';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { randomFont } from '@/components/ControlRail';

interface PrimingZenithalPanelProps {
  primeColor: PrimeColor;
  zenithalEnabled: boolean;
  zenithalScheme: ZenithalScheme;
  zenithalMethod: ZenithalMethod;
  zenithalDirection: ZenithalDirection;
  currentTemp: number | null;
  manualTempInput: number | null;
  images: UploadedImage[];
  primingResultMap: Record<string, string | null>;
  onPrimeColorChange: (v: PrimeColor) => void;
  onZenithalEnabledChange: (v: boolean) => void;
  onZenithalSchemeChange: (v: ZenithalScheme) => void;
  onZenithalMethodChange: (v: ZenithalMethod) => void;
  onZenithalDirectionChange: (v: ZenithalDirection) => void;
  onManualTempChange: (v: number | null) => void;
  assembledPrompt: string;
  miniature: {
    name: string; setName: (v: string) => void;
    origin: string; setOrigin: (v: string) => void;
    manufacturer: string; setManufacturer: (v: string) => void;
    role: string; setRole: (v: string) => void;
    customRole: string; setCustomRole: (v: string) => void;
  };
  onSubmitRepaint: () => void;
  currentlyRepainting: boolean;
  submitError: string | null;
  pipelineComplete: boolean;
  sharedSliderIndex: number;
  onSliderIndexChange: (i: number) => void;
  primingRepaintMap: Record<number, string>;
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

function getPrimedBadgeRight(primeColor: PrimeColor, zenithalEnabled: boolean, zenithalScheme: ZenithalScheme): string {
  if (!zenithalEnabled || zenithalScheme === 'flat') {
    const colorLabel = primeColor.charAt(0).toUpperCase() + primeColor.slice(1);
    return `Primed · ${colorLabel}`;
  }
  const schemeLabel = zenithalScheme === '2tone' ? '2T' : '3T';
  return `Primed · Zenithal ${schemeLabel}`;
}

export function PrimingZenithalPanel({
  primeColor, zenithalEnabled, zenithalScheme, zenithalMethod, zenithalDirection,
  currentTemp, manualTempInput,
  images, primingResultMap,
  onPrimeColorChange, onZenithalEnabledChange, onZenithalSchemeChange,
  onZenithalMethodChange, onZenithalDirectionChange,
  onManualTempChange,
  assembledPrompt, miniature, onSubmitRepaint,
  currentlyRepainting, submitError,
  pipelineComplete, sharedSliderIndex, onSliderIndexChange,
  primingRepaintMap,
}: PrimingZenithalPanelProps) {
  const [surfacePrepOpen, setSurfacePrepOpen] = useState(false);

  const mainImages = images.filter(i => i.type === 'main');

  const slides: SliderImage[] = useMemo(() => {
    const result: SliderImage[] = [];
    for (const img of mainImages) {
      result.push({
        id: `${img.id}-original`,
        src: img.objectUrl,
        badgeLeft: 'Original',
        badgeRight: 'Unprimed',
        badgeRightAccent: true,
      });
      const primedSrc = primingResultMap[img.id];
      result.push({
        id: `${img.id}-primed`,
        src: primedSrc || img.objectUrl,
        badgeLeft: 'Primed',
        badgeRight: primedSrc
          ? getPrimedBadgeRight(primeColor, zenithalEnabled, zenithalScheme)
          : 'Processing…',
        badgeRightAccent: true,
      });
    }
    return result;
  }, [mainImages, primingResultMap, primeColor, zenithalEnabled, zenithalScheme]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: `'${randomFont}', sans-serif` }}>Priming</h2>
        <p className="text-sm text-muted-foreground">Set up your undercoat strategy.</p>
      </div>

      {/* Image display — DualSlider when pipeline complete, ImageSlider otherwise */}
      {pipelineComplete ? (
        <DualSlider
          leftImages={mainImages.map(img => ({
            src: img.objectUrl,
            label: 'Unprimed',
          }))}
          rightImages={mainImages.map((_, i) => ({
            src: primingRepaintMap[i] ?? '',
            label: 'Primed',
          }))}
          sharedIndex={sharedSliderIndex}
          onIndexChange={onSliderIndexChange}
        />
      ) : (
        slides.length > 0 && <ImageSlider slides={slides} />
      )}

      {/* Paint Directive */}
      {pipelineComplete && (
        <PaintDirectivePanel
          miniature={miniature}
        />
      )}

      {/* Surface Prep — collapsible, open by default */}
      <Collapsible open={surfacePrepOpen} onOpenChange={setSurfacePrepOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-card/80 transition-colors">
          <span className="text-sm font-medium text-foreground">Surface preparation</span>
          <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', surfacePrepOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-4 p-4 rounded-xl bg-card/50 border border-border">
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

          <SprayViabilityBadge temp={currentTemp} />

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Prep checklist</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Remove mould lines with a hobby knife</li>
              <li>• Wash resin/metal miniatures in warm soapy water</li>
              <li>• Ensure parts are dry before priming</li>
              <li>• Subassemble complex models if needed</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <OptionButtons
        label="Prime color"
        options={[
          { value: 'black' as PrimeColor, label: 'Black' },
          { value: 'grey' as PrimeColor, label: 'Grey' },
          { value: 'white' as PrimeColor, label: 'White' },
        ]}
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
          <div className="space-y-2">
            <OptionButtons
              label="Zenithal scheme"
              options={[
                { value: 'flat' as ZenithalScheme, label: 'Flat' },
                { value: '2tone' as ZenithalScheme, label: '2-Tone' },
                { value: '3tone' as ZenithalScheme, label: '3-Tone' },
              ]}
              value={zenithalScheme}
              onChange={onZenithalSchemeChange}
            />
          </div>

          <OptionButtons
            label="Application method"
            options={[
              { value: 'drybrush' as ZenithalMethod, label: 'Drybrush' },
              { value: 'spray' as ZenithalMethod, label: 'Spray / Rattle can' },
            ]}
            value={zenithalMethod}
            onChange={onZenithalMethodChange}
          />

          <OptionButtons
            label="Light direction"
            options={[
              { value: 'top-left' as ZenithalDirection, label: '↖ Top-left' },
              { value: 'top' as ZenithalDirection, label: '↑ Top' },
              { value: 'top-right' as ZenithalDirection, label: '↗ Top-right' },
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
              The zenithal direction influences how the color preview reads — brighter on the lit side, deeper shadows on the opposite side.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
