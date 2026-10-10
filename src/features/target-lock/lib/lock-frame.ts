import type { ScreenFrame } from '@/lib/screen-frame';

const FRAME_PADDING_PIXELS = 10;
const MIN_CORNER_PIXELS = 14;
const MAX_CORNER_PIXELS = 20;
const CORNER_RADIUS_RATIO = 0.4;

export function getLockFrameBox(frame: ScreenFrame): { left: number; top: number; size: number } {
  const halfSize = frame.radius + FRAME_PADDING_PIXELS;
  return { left: frame.x - halfSize, top: frame.y - halfSize, size: halfSize * 2 };
}

export function getCornerSize(radius: number): number {
  if (!(radius > 0)) return MIN_CORNER_PIXELS;
  return Math.min(MAX_CORNER_PIXELS, Math.max(MIN_CORNER_PIXELS, radius * CORNER_RADIUS_RATIO));
}
