import { cn } from '@/lib/utils';

interface DualSliderProps {
  initialRepaintImage: string | null;
  customRepaintImage: string | null;
  sliderIndex: number;
  onSliderIndexChange: (i: number) => void;
}

export function DualSlider({
  initialRepaintImage,
  customRepaintImage,
  sliderIndex,
  onSliderIndexChange,
}: DualSliderProps) {
  const panels = [
    { label: 'Initial repaint', src: initialRepaintImage },
    { label: 'Custom repaint', src: customRepaintImage },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {panels.map((panel, i) => (
        <div key={i} className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{panel.label}</p>
          <div
            onClick={() => onSliderIndexChange(i)}
            className={cn(
              'rounded-xl border-2 overflow-hidden cursor-pointer transition-colors',
              sliderIndex === i ? 'border-primary' : 'border-border'
            )}
          >
            {panel.src ? (
              <img
                src={panel.src}
                alt={panel.label}
                className="w-full rounded-md object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-muted/30 rounded-md">
                <span className="text-xs text-muted-foreground">
                  {i === 0 ? 'Awaiting initial repaint' : 'No custom repaint yet'}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
