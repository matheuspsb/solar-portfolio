const BACK_OVERSHOOT = 1.70158;

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function seg(time: number, start: number, end: number): number {
  if (end <= start) return time >= end ? 1 : 0;
  return clamp01((time - start) / (end - start));
}

export function mix(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export function enter(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

export function draw(progress: number): number {
  if (progress < 0.5) return 4 * progress * progress * progress;
  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function pop(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  const cubicFactor = BACK_OVERSHOOT + 1;
  return 1 + cubicFactor * Math.pow(progress - 1, 3) + BACK_OVERSHOOT * Math.pow(progress - 1, 2);
}
