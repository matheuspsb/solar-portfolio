const FOCUSED_PERCENT = 18;
const FILLED_PERCENT = 55;
const FULL_PERCENT = 100;

type UnderlineInput = { hasValue: boolean; isFocused: boolean; isValid: boolean };

export function getUnderlinePercent({ hasValue, isFocused, isValid }: UnderlineInput): number {
  if (isValid) return FULL_PERCENT;
  if (hasValue) return FILLED_PERCENT;
  return isFocused ? FOCUSED_PERCENT : 0;
}

export function getRingOffset({ count, max }: { count: number; max: number }): number {
  if (!(count > 0) || !(max > 0)) return FULL_PERCENT;
  return FULL_PERCENT - Math.min(FULL_PERCENT, (count / max) * FULL_PERCENT);
}
