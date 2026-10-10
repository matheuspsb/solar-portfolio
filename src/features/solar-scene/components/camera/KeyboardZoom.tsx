import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { getZoomKeyDirection, getZoomedDistance } from '../../lib/zoom';

type KeyboardZoomProps = {
  minDistance: number;
  maxDistance: number;
  isEnabled: boolean;
};

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function KeyboardZoom({ minDistance, maxDistance, isEnabled }: KeyboardZoomProps) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const hasShortcutModifier = event.ctrlKey || event.metaKey || event.altKey;
      const direction = getZoomKeyDirection(event.key);
      if (hasShortcutModifier || direction === null || isTextEntryTarget(event.target)) return;

      const distance = getZoomedDistance({
        current: camera.position.length(),
        minDistance,
        maxDistance,
        direction,
      });
      camera.position.setLength(distance);
      invalidate();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera, invalidate, isEnabled, minDistance, maxDistance]);

  return null;
}
