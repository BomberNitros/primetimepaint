import { SpeedpaintColor } from '@/types/primetime';

// Speedpaint Most Wanted set — 24 colours with approximate hex values
export const SPEEDPAINT_MOST_WANTED: SpeedpaintColor[] = [
  { name: 'Angel Green', hex: '#7ec8a4', lidColor: 'white' },
  { name: 'Ballistic Grey', hex: '#6b6f73', lidColor: 'white' },
  { name: 'Bountiful Brown', hex: '#8b5e3c', lidColor: 'white' },
  { name: 'Crusader Skin', hex: '#d4a574', lidColor: 'white' },
  { name: 'Dark Wood', hex: '#5c3a1e', lidColor: 'white' },
  { name: 'Demolisher Skin', hex: '#c68e6a', lidColor: 'white' },
  { name: 'Disgusting Slime', hex: '#a3c53a', lidColor: 'white' },
  { name: 'Dungeon Stone', hex: '#8a8d8f', lidColor: 'white' },
  { name: 'Grim Black', hex: '#2a2a2a', lidColor: 'white' },
  { name: 'Hardened Leather', hex: '#6b4226', lidColor: 'white' },
  { name: 'Hive Dweller Purple', hex: '#6b3fa0', lidColor: 'white' },
  { name: 'Hot Orange', hex: '#e8601c', lidColor: 'white' },
  { name: 'Killer Bee Yellow', hex: '#f0c830', lidColor: 'white' },
  { name: 'Lava Orange', hex: '#d4451a', lidColor: 'white' },
  { name: 'Lich Purple', hex: '#523678', lidColor: 'white' },
  { name: 'Lore Master Blue', hex: '#2e5fa1', lidColor: 'white' },
  { name: 'Maggot Green', hex: '#c8d87a', lidColor: 'white' },
  { name: 'Marsh Brown', hex: '#5a4a32', lidColor: 'white' },
  { name: 'Mud and Filth', hex: '#7a6840', lidColor: 'white' },
  { name: 'Nuclear Rad Green', hex: '#5ce62e', lidColor: 'white' },
  { name: 'Oil Stain', hex: '#3a3a30', lidColor: 'white' },
  { name: 'Plague Lord Green', hex: '#4a7a3a', lidColor: 'white' },
  { name: 'Runic Grey', hex: '#a0a4a8', lidColor: 'white' },
  { name: 'Skeleton Bone', hex: '#e0d8c0', lidColor: 'white' },
];

export function getSpeedpaintByName(name: string): SpeedpaintColor | undefined {
  return SPEEDPAINT_MOST_WANTED.find(p => p.name === name);
}
