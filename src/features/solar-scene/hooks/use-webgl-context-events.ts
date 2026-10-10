import { useEffect, useEffectEvent } from 'react';

type ContextCallbacks = {
  onLost: () => void;
  onRestored: () => void;
};

export function useWebglContextEvents(
  target: EventTarget | null,
  { onLost, onRestored }: ContextCallbacks,
): void {
  const notifyLost = useEffectEvent(onLost);
  const notifyRestored = useEffectEvent(onRestored);

  useEffect(() => {
    if (!target) return;
    const handleLost = (event: Event) => {
      event.preventDefault();
      notifyLost();
    };
    const handleRestored = () => notifyRestored();
    target.addEventListener('webglcontextlost', handleLost);
    target.addEventListener('webglcontextrestored', handleRestored);
    return () => {
      target.removeEventListener('webglcontextlost', handleLost);
      target.removeEventListener('webglcontextrestored', handleRestored);
    };
  }, [target]);
}
