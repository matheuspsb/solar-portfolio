const HIGHLIGHT_EASING_RATE = 10;

/** Easing rate that applies a change in a single frame. */
export const INSTANT_EASING_RATE = Number.POSITIVE_INFINITY;

export function getTransitionSeconds(baseSeconds: number, prefersReducedMotion: boolean): number {
  if (prefersReducedMotion) return 0;
  return Number.isFinite(baseSeconds) && baseSeconds > 0 ? baseSeconds : 0;
}

/** `null` means "do not rotate automatically". */
export function getRotationPeriodForMotion(
  periodSeconds: number,
  prefersReducedMotion: boolean,
): number | null {
  return prefersReducedMotion ? null : periodSeconds;
}

export function getHighlightEasingRate(prefersReducedMotion: boolean): number {
  return prefersReducedMotion ? INSTANT_EASING_RATE : HIGHLIGHT_EASING_RATE;
}

type FrameloopInput = {
  prefersReducedMotion: boolean;
  /** False while something (the content panel) covers the scene. */
  isSceneActive: boolean;
};

/** 'demand' still redraws on resize, pointer events and prop changes, but stops the idle loop. */
export function getFrameloop({
  prefersReducedMotion,
  isSceneActive,
}: FrameloopInput): 'always' | 'demand' {
  return prefersReducedMotion || !isSceneActive ? 'demand' : 'always';
}
