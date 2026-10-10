import type { ThreeEvent } from '@react-three/fiber';
import { isClickGesture } from '@/domain/interaction-state';

type BodyPointerCallbacks = {
  onPointerOver: () => void;
  onPointerOut: () => void;
  onSelect: () => void;
  isArmed: boolean;
};

const isTouch = (event: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>): boolean =>
  (event.nativeEvent as PointerEvent | undefined)?.pointerType === 'touch';

export function useBodyPointerHandlers({
  onPointerOver,
  onPointerOut,
  onSelect,
  isArmed,
}: BodyPointerCallbacks) {
  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onPointerOver();
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    if (isTouch(event)) return;
    onPointerOut();
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (!isClickGesture(event.delta)) return;
    event.stopPropagation();
    if (isTouch(event) && !isArmed) {
      onPointerOver();
      return;
    }
    onSelect();
  };

  return { handlePointerOver, handlePointerOut, handleClick };
}
