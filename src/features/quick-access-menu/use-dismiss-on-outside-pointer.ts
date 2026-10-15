import { useEffect, useEffectEvent } from 'react';
import type { RefObject } from 'react';

export function useDismissOnOutsidePointer(
  containerRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
  isActive: boolean,
): void {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!isActive) return;
    const dismissOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) dismiss();
    };
    document.addEventListener('pointerdown', dismissOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', dismissOnOutsidePointer);
  }, [isActive, containerRef]);
}
