export type ZoomDirection = 'in' | 'out';

const ZOOM_STEP_FACTOR = 1.15;

const directionByKey: Partial<Record<string, ZoomDirection>> = {
  '+': 'in',
  '=': 'in',
  '-': 'out',
  _: 'out',
};

export function getZoomKeyDirection(key: string): ZoomDirection | null {
  return directionByKey[key] ?? null;
}

type ZoomInput = {
  current: number;
  minDistance: number;
  maxDistance: number;
  direction: ZoomDirection;
};

/** One keyboard zoom step, always kept inside [minDistance, maxDistance]. */
export function getZoomedDistance({
  current,
  minDistance,
  maxDistance,
  direction,
}: ZoomInput): number {
  const areLimitsValid =
    Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance <= maxDistance;
  if (!areLimitsValid) return current;

  const isCurrentUsable = Number.isFinite(current) && current > 0;
  const startDistance = isCurrentUsable ? current : maxDistance;
  const factor = direction === 'in' ? 1 / ZOOM_STEP_FACTOR : ZOOM_STEP_FACTOR;
  return Math.min(Math.max(startDistance * factor, minDistance), maxDistance);
}
