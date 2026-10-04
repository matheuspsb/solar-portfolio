import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * True (in the returned ref) once the visitor grabbed the scene with the orbit controls. The
 * automatic camera follow then stays out of their way until a new focus request (`focusNonce`) comes in.
 */
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
