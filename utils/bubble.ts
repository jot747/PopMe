import { TaskPosition } from '@/types/task';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export const getBubbleSize = (priority: number) => {
  const clamped = clamp(priority, 1, 5);
  return 64 + clamped * 16; // 80..144
};

export const getEnergyColors = (energy: number) => {
  const clamped = clamp(energy, 1, 5);
  const palettes: string[][] = [
    ['#A7D6FF', '#D9F0FF'],
    ['#93E3D1', '#D2FAF3'],
    ['#B8E07A', '#E9F7C9'],
    ['#FFC36B', '#FFE7B5'],
    ['#FF8F7A', '#FFD3C7'],
  ];

  return palettes[clamped - 1];
};

export const getRandomPosition = (): TaskPosition => {
  // Keep some padding from edges by restricting to 10%..85%
  const x = 0.1 + Math.random() * 0.75;
  const y = 0.1 + Math.random() * 0.65;
  return { x, y };
};

export const normalizePosition = (value: number) => clamp(value, 0.05, 0.9);
