import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Camera, PerspectiveCamera } from 'three';
import { dampValue } from '@/lib/damp';

const SETTLED_DISTANCE_PIXELS = 0.5;

type CameraViewOffsetProps = {
  /** Pixels to shift the rendered view to the right (the scene moves left). */
  targetOffsetPixels: number;
  /** `Infinity` jumps straight to the target (reduced motion). */
  easingRate: number;
};

function isPerspectiveCamera(camera: Camera): camera is PerspectiveCamera {
  return 'isPerspectiveCamera' in camera;
}

/** Eases a horizontal projection shift so the scene can slide aside for the content panel. */
export function CameraViewOffset({ targetOffsetPixels, easingRate }: CameraViewOffsetProps) {
  const currentOffsetRef = useRef(0);

  useFrame(({ camera, size, invalidate }, deltaSeconds) => {
    if (!isPerspectiveCamera(camera)) return;
    const target = Number.isFinite(targetOffsetPixels) ? targetOffsetPixels : 0;
    const eased = dampValue({
      current: currentOffsetRef.current,
      target,
      rate: easingRate,
      deltaSeconds,
    });
    const isSettled = Math.abs(eased - target) < SETTLED_DISTANCE_PIXELS;
    currentOffsetRef.current = isSettled ? target : eased;

    if (currentOffsetRef.current === 0) {
      if (camera.view) camera.clearViewOffset();
    } else {
      camera.setViewOffset(
        size.width,
        size.height,
        currentOffsetRef.current,
        0,
        size.width,
        size.height,
      );
    }
    // In on-demand mode nothing else asks for the next frame of the glide.
    if (!isSettled) invalidate();
  });

  return null;
}
