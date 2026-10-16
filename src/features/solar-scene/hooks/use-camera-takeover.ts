import { useEffect, useEffectEvent, useState } from 'react';

export function useCameraTakeover(
  controls: EventTarget | null | undefined,
  focusNonce: number,
): boolean {
  const [takeover, setTakeover] = useState({ nonce: focusNonce, isTakenOver: false });
  const markTakenOver = useEffectEvent(() => setTakeover({ nonce: focusNonce, isTakenOver: true }));

  useEffect(() => {
    if (!controls) return;
    const handleStart = () => markTakenOver();
    controls.addEventListener('start', handleStart);
    return () => controls.removeEventListener('start', handleStart);
  }, [controls]);

  return takeover.isTakenOver && takeover.nonce === focusNonce;
}
