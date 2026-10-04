import type { ThreeEvent } from '@react-three/fiber';
import { isClickGesture } from '@/lib/interaction-state';

type BodyPointerCallbacks = {
  onPointerOver: () => void;
  onSelect: () => void;
};

/** Pointer-over and click handlers for a body; a click that was really an orbit drag is ignored. */
export function useBodyPointerHandlers({ onPointerOver, onSelect }: BodyPointerCallbacks) {
  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onPointerOver();
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!isClickGesture(event.delta)) return;
    event.stopPropagation();
    onSelect();
  };

  return { handlePointerOver, handleClick };
}
