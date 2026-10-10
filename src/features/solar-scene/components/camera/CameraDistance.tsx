import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

type CameraDistanceProps = {
  distance: number;
};

const DEFAULT_VIEW_AXIS_Z = 1;

export function CameraDistance({ distance }: CameraDistanceProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    if (!Number.isFinite(distance) || distance <= 0) return;
    const isAtOrigin = camera.position.lengthSq() === 0;
    if (isAtOrigin) camera.position.set(0, 0, DEFAULT_VIEW_AXIS_Z);
    camera.position.setLength(distance);
  }, [camera, distance]);

  return null;
}
