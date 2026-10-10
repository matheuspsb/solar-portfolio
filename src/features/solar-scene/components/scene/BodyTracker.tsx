import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import type { ScreenFrame } from '@/lib/screen-frame';
import { dampValue } from '../../lib/damp';
import { getBodySceneName } from '../../lib/body-scene-name';
import { projectSphere } from '../../lib/project-sphere';

const SETTLED_DISTANCE_PIXELS = 0.05;

type TrackedBody = { id: string; radius: number };

type BodyTrackerProps = {
  targetId: string | null;
  bodies: readonly TrackedBody[];
  easingRate: number;
  onFrame: (frame: ScreenFrame | null) => void;
};

function easeComponent(current: number, target: number, rate: number, deltaSeconds: number) {
  const eased = dampValue({ current, target, rate, deltaSeconds });
  return Math.abs(eased - target) < SETTLED_DISTANCE_PIXELS ? target : eased;
}

function easeFrame(
  current: ScreenFrame,
  target: ScreenFrame,
  rate: number,
  deltaSeconds: number,
): ScreenFrame {
  return {
    x: easeComponent(current.x, target.x, rate, deltaSeconds),
    y: easeComponent(current.y, target.y, rate, deltaSeconds),
    radius: easeComponent(current.radius, target.radius, rate, deltaSeconds),
  };
}

function isSameFrame(first: ScreenFrame | null, second: ScreenFrame | null): boolean {
  if (first === null || second === null) return first === second;
  return first.x === second.x && first.y === second.y && first.radius === second.radius;
}

export function BodyTracker({ targetId, bodies, easingRate, onFrame }: BodyTrackerProps) {
  const invalidate = useThree((state) => state.invalidate);
  const [worldPosition] = useState(() => new Vector3());
  const trackedIdRef = useRef<string | null>(null);
  const easedRef = useRef<ScreenFrame | null>(null);
  const publishedRef = useRef<ScreenFrame | null>(null);

  useEffect(() => {
    invalidate();
  }, [targetId, invalidate]);

  useFrame(({ scene, camera, size }, deltaSeconds) => {
    if (trackedIdRef.current !== targetId) {
      trackedIdRef.current = targetId;
      easedRef.current = null;
    }

    const object = targetId === null ? null : scene.getObjectByName(getBodySceneName(targetId));
    const radius = bodies.find((body) => body.id === targetId)?.radius;
    let projected: ScreenFrame | null = null;
    if (object && radius !== undefined) {
      camera.updateMatrixWorld();
      object.getWorldPosition(worldPosition);
      projected = projectSphere({
        center: worldPosition,
        radius,
        camera,
        width: size.width,
        height: size.height,
      });
    }

    if (projected === null) {
      easedRef.current = null;
      if (publishedRef.current !== null) {
        publishedRef.current = null;
        onFrame(null);
      }
      return;
    }

    const eased = easeFrame(easedRef.current ?? projected, projected, easingRate, deltaSeconds);
    easedRef.current = eased;
    if (!isSameFrame(publishedRef.current, eased)) {
      publishedRef.current = eased;
      onFrame(eased);
    }
    if (!isSameFrame(eased, projected)) invalidate();
  });

  return null;
}
