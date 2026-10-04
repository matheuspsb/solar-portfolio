const HIGHLIGHT_EASING_RATE = 10;

export const INSTANT_EASING_RATE = Number.POSITIVE_INFINITY;

export function getTransitionSeconds(baseSeconds: number, prefersReducedMotion: boolean): number {
  if (prefersReducedMotion) return 0;
  return Number.isFinite(baseSeconds) && baseSeconds > 0 ? baseSeconds : 0;
}

export function getRotationPeriodForMotion(
  periodSeconds: number,
  prefersReducedMotion: boolean,
): number | null {
  return prefersReducedMotion ? null : periodSeconds;
}

export function getHighlightEasingRate(prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? INSTANT_EASING_RATE : HIGHLIGHT_EASING_RATE;
}

export function getFrameloop(prefersReducedMotion: boolean): 'always' | 'demand' {
  return prefersReducedMotion ? 'demand' : 'always';
}

const TRANSITION_SETTLE_FACTOR = 5;

export function getTransitionRate(seconds: number): number {
  const isDurationUsable = Number.isFinite(seconds) && seconds > 0;
  return isDurationUsable ? TRANSITION_SETTLE_FACTOR / seconds : INSTANT_EASING_RATE;
}
