import { ARC_WIDTH } from './arc-geometry';

export function getStageScale(availableWidth: number): number {
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) return 1;
  return Math.min(1, availableWidth / ARC_WIDTH);
}
