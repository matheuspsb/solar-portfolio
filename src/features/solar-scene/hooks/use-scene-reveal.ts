import { useEffect, useState } from 'react';

type SceneRevealOptions = {
  bodyIds: readonly string[];
  maxWaitMs: number;
  onRevealChange?: (isRevealed: boolean) => void;
};

type SceneReveal = {
  isRevealed: boolean;
  markBodySettled: (id: string) => void;
  markEffectsReady: () => void;
};

export function useSceneReveal({
  bodyIds,
  maxWaitMs,
  onRevealChange,
}: SceneRevealOptions): SceneReveal {
  const [settledIds, setSettledIds] = useState<ReadonlySet<string>>(new Set());
  const [areEffectsReady, setAreEffectsReady] = useState(false);
  const [hasWaitedTooLong, setHasWaitedTooLong] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasWaitedTooLong(true), maxWaitMs);
    return () => clearTimeout(timer);
  }, [maxWaitMs]);

  const markBodySettled = (id: string) => {
    if (!bodyIds.includes(id)) return;
    setSettledIds((current) => (current.has(id) ? current : new Set(current).add(id)));
  };

  const markEffectsReady = () => setAreEffectsReady(true);

  const areBodiesSettled = bodyIds.every((id) => settledIds.has(id));
  const isRevealed = hasWaitedTooLong || (areEffectsReady && areBodiesSettled);

  useEffect(() => {
    onRevealChange?.(isRevealed);
  }, [isRevealed, onRevealChange]);

  return { isRevealed, markBodySettled, markEffectsReady };
}
