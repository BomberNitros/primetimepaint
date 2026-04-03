import { Vibrate, Droplets, Layers, Grid3X3, Paintbrush, Palette, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { randomFont } from '@/components/ControlRail';

interface VideoSet {
  goobertown: [string, string];
  danahowl: [string, string];
}

const tips: {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  videos: VideoSet;
}[] = [
  {
    title: 'Shake your paints',
    desc: 'Shake Speedpaints vigorously for 2+ minutes before every use. The medium and pigment separate quickly.',
    icon: Vibrate,
    videos: { goobertown: ['m1Ra2jLhrkU', 'D40x2eQvduU'], danahowl: ['Gcqhhwq6nHc', 'qLB-uX2PZjU'] },
  },
  {
    title: 'Consistency check',
    desc: 'Speedpaints should flow off the brush like milk — not water, not yoghurt. Test on your thumbnail first.',
    icon: Droplets,
    videos: { goobertown: ['m1Ra2jLhrkU', 'Ml7wSlvCVd8'], danahowl: ['Gcqhhwq6nHc', 'H2Q22DcF3qw'] },
  },
  {
    title: 'One thick coat myth',
    desc: 'Despite the name, apply in controlled amounts. Flooding recesses causes pooling and tide marks.',
    icon: Layers,
    videos: { goobertown: ['m1Ra2jLhrkU', 'v-BlVYFxfRA'], danahowl: ['Gcqhhwq6nHc', 'H2Q22DcF3qw'] },
  },
  {
    title: 'Work in sections',
    desc: 'Apply to one area at a time. Speedpaints reactivate when wet, so avoid going back over drying areas.',
    icon: Grid3X3,
    videos: { goobertown: ['v-BlVYFxfRA', 'm1Ra2jLhrkU'], danahowl: ['H2Q22DcF3qw', 'qLB-uX2PZjU'] },
  },
  {
    title: 'Clean brush between colours',
    desc: 'Speedpaints stain brushes fast. Rinse thoroughly and reshape the tip before switching colours.',
    icon: Paintbrush,
    videos: { goobertown: ['WCWd1TPHZOg', 'MvHxxVlSNnw'], danahowl: ['Gcqhhwq6nHc', 'e_MzYhKp2HM'] },
  },
  {
    title: 'Palette discipline',
    desc: 'Use a wet palette to keep Speedpaints workable. They dry faster than traditional acrylics on dry palettes.',
    icon: Palette,
    videos: { goobertown: ['Ml7wSlvCVd8', 'D40x2eQvduU'], danahowl: ['H2Q22DcF3qw', 'e_MzYhKp2HM'] },
  },
];

function VideoPanel({ videos, title }: { videos: VideoSet; title: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleToggle = () => {
    if (!open && !loaded) setLoaded(true);
    setOpen(o => !o);
  };

  const allIds = [...videos.goobertown, ...videos.danahowl];
  const labels = ['Goobertown Hobbies', 'Goobertown Hobbies', 'DanaHowl', 'DanaHowl'];

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
        Watch related videos
      </button>
      {open && loaded && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {allIds.map((id, i) => (
            <iframe
              key={id + i}
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${id}`}
              frameBorder="0"
              allowFullScreen
              title={`${title} — ${labels[i]}`}
              className="rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PaintHandlingPanel() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Handling</h2>
        <p className="text-sm text-muted-foreground">Handling tips specific to Speedpaints.</p>
      </div>

      <div className="space-y-2">
        {tips.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.title} className="p-3 rounded-xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                  <VideoPanel videos={t.videos} title={t.title} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
