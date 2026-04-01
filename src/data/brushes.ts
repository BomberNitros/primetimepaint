import { BrushRecommendation } from '@/types/primetime';

export const PREMIUM_ROUND_BRUSHES = [
  { name: 'Size 3', size: '3' },
  { name: 'Size 1', size: '1' },
  { name: 'Size 0', size: '0' },
  { name: 'Size 2/0', size: '2/0' },
  { name: 'Size 5/0', size: '5/0' },
];

export const UTILITY_BRUSHES = [
  { name: 'Filbert 1', type: 'Filbert' },
  { name: 'Flat 1', type: 'Flat' },
  { name: 'Angle 1', type: 'Angle' },
  { name: 'Round 1', type: 'Round' },
  { name: 'Round 0', type: 'Round' },
  { name: 'Liner 2/0', type: 'Liner' },
  { name: 'Liner 3/0 (×2)', type: 'Liner' },
  { name: 'Liner 4/0', type: 'Liner' },
  { name: 'Small Round/Spot 4/0', type: 'Spot' },
  { name: 'Small Angle/Spot 4/0', type: 'Spot' },
];

export const BRUSH_RECOMMENDATIONS: BrushRecommendation[] = [
  { task: 'Basecoating large areas', brush: 'Size 3', set: 'premium-round', tip: 'Load generously, let the belly carry paint' },
  { task: 'Basecoating standard areas', brush: 'Size 1', set: 'premium-round', tip: 'Good all-rounder for torsos, cloaks' },
  { task: 'Detail work', brush: 'Size 0', set: 'premium-round', tip: 'Faces, buckles, small trim' },
  { task: 'Fine detail', brush: 'Size 2/0', set: 'premium-round', tip: 'Eyes, gemstones, tiny icons' },
  { task: 'Ultra-fine detail', brush: 'Size 5/0', set: 'premium-round', tip: 'Pupils, script, finest lines' },
  { task: 'Drybrushing', brush: 'Flat 1', set: 'utility', tip: 'Splay slightly for texture highlights' },
  { task: 'Blending / wet blending', brush: 'Filbert 1', set: 'utility', tip: 'Rounded tip helps smooth transitions' },
  { task: 'Edge highlighting', brush: 'Angle 1', set: 'utility', tip: 'Angled tip follows armour edges naturally' },
  { task: 'Fine lining', brush: 'Liner 3/0 (×2)', set: 'utility', tip: 'Thin paint to ink consistency for panel lines' },
  { task: 'Dot work / spots', brush: 'Small Round/Spot 4/0', set: 'utility', tip: 'Rivets, studs, small dots of colour' },
];
