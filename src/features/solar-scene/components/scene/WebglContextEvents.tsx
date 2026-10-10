import { useThree } from '@react-three/fiber';
import { useWebglContextEvents } from '../../hooks/use-webgl-context-events';

type WebglContextEventsProps = {
  onLost: () => void;
  onRestored: () => void;
};

export function WebglContextEvents({ onLost, onRestored }: WebglContextEventsProps) {
  const canvas = useThree((state) => state.gl.domElement);
  useWebglContextEvents(canvas, { onLost, onRestored });
  return null;
}
