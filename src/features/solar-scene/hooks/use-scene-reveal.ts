import { useEffect, useState } from 'react';

type SceneRevealOptions = {
  bodyIds: readonly string[];
  maxWaitMs: number;
};

type SceneReveal = {
  isRevealed: boolean;
  markBodySettled: (id: string) => void;
  markEffectsReady: () => void;
};

export function useSceneReveal({ bodyIds, maxWaitMs }: SceneRevealOptions): SceneReveal {
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
  return {
    isRevealed: hasWaitedTooLong || (areEffectsReady && areBodiesSettled),
    markBodySettled,
    markEffectsReady,
  };
}
