import { useEffect, useState } from 'react';

export const SHOW_DELAY_MS = 80;
export const HIDE_DELAY_MS = 150;
const SWITCH_DELAY_MS = 0;

function getDelay(target: string | null, shown: string | null): number {
  if (target === null) return HIDE_DELAY_MS;
  return shown === null ? SHOW_DELAY_MS : SWITCH_DELAY_MS;
}

export function useIntentTarget(target: string | null): string | null {
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (target === shown) return;
    const timer = setTimeout(() => setShown(target), getDelay(target, shown));
    return () => clearTimeout(timer);
  }, [target, shown]);

  return shown;
}
