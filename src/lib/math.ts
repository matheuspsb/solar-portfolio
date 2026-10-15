export function clamp(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value)) return minimum;
  return Math.max(minimum, Math.min(maximum, value));
}

export function mix(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}
