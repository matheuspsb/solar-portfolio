type DampInput = {
  current: number;
  target: number;
  rate: number;
  deltaSeconds: number;
};

export function dampValue({ current, target, rate, deltaSeconds }: DampInput): number {
  if (!Number.isFinite(current)) return target;
  const isDeltaUsable = deltaSeconds > 0;
  const isRateUsable = rate > 0;
  if (!isDeltaUsable || !isRateUsable) return current;
  if (rate === Number.POSITIVE_INFINITY) return target;
  const remainingFraction = Math.exp(-rate * deltaSeconds);
  return target + (current - target) * remainingFraction;
}
