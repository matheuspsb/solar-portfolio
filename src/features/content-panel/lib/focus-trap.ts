type TabTargetInput = {
  count: number;
  activeIndex: number;
  isShift: boolean;
};

type TabTarget = { action: 'native' } | { action: 'focus'; index: number } | { action: 'block' };

export function getTabTarget({ count, activeIndex, isShift }: TabTargetInput): TabTarget {
  if (!(count > 0)) return { action: 'block' };

  const lastIndex = count - 1;
  const isOutsideList = activeIndex === -1;
  if (isOutsideList) return { action: 'focus', index: isShift ? lastIndex : 0 };
  if (isShift && activeIndex === 0) return { action: 'focus', index: lastIndex };
  if (!isShift && activeIndex === lastIndex) return { action: 'focus', index: 0 };
  return { action: 'native' };
}
