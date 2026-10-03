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
