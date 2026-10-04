import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useCameraTakeover(
  controls: EventTarget | null | undefined,
  focusNonce: number,
): RefObject<boolean> {
  const hasTakenOverRef = useRef(false);

  useEffect(() => {
    hasTakenOverRef.current = false;
  }, [focusNonce]);

  useEffect(() => {
    if (!controls) return;
    const markTakenOver = () => {
      hasTakenOverRef.current = true;
    };
    controls.addEventListener('start', markTakenOver);
    return () => controls.removeEventListener('start', markTakenOver);
  }, [controls]);

  return hasTakenOverRef;
}
