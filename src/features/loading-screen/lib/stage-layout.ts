import { STAGE_HEIGHT, STAGE_WIDTH } from './star-marks';

const FALLBACK_SCALE = 1;
const MAX_PIXEL_RATIO = 2;
const MIN_PIXEL_RATIO = 1;

export function getStageScale(viewportWidth: number, viewportHeight: number): number {
  const coverScale = Math.max(viewportWidth / STAGE_WIDTH, viewportHeight / STAGE_HEIGHT);
  return coverScale > 0 && Number.isFinite(coverScale) ? coverScale : FALLBACK_SCALE;
}

export function getPixelRatio(devicePixelRatio: number): number {
  if (!Number.isFinite(devicePixelRatio)) return MIN_PIXEL_RATIO;
  return Math.min(MAX_PIXEL_RATIO, Math.max(MIN_PIXEL_RATIO, devicePixelRatio));
}
