import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import {
  advanceDiveProgress,
  easeDive,
  getDiveEndPose,
  getFillDistance,
  interpolatePose,
} from '../../lib/camera-dive';
import type { CameraPose } from '../../lib/camera-dive';
import { getBodySceneName } from '../../lib/body-scene-name';
import type { DiveRequest } from '../../types';

type DiveControls = { enabled: boolean; target: Vector3; update: () => void };

type ActiveDive = Pick<DiveRequest, 'bodyId' | 'direction' | 'durationSeconds'> & {
  progress: number;
  from: CameraPose;
};

type CameraDiveProps = {
  dive: DiveRequest | null;
  bodyRadius: number;
  fieldOfViewDegrees: number;
};

function readPose(position: Vector3, target: Vector3): CameraPose {
  return {
    position: { x: position.x, y: position.y, z: position.z },
    target: { x: target.x, y: target.y, z: target.z },
  };
}

export function CameraDive({ dive, bodyRadius, fieldOfViewDegrees }: CameraDiveProps) {
  const camera = useThree((state) => state.camera);
  const readState = useThree((state) => state.get);
  const activeRef = useRef<ActiveDive | null>(null);
  const homeRef = useRef<CameraPose | null>(null);
  const fallbackTarget = useRef(new Vector3());
  const bodyPosition = useRef(new Vector3());

  const nonce = dive?.nonce;
  useEffect(() => {
    if (!dive) return;
    const controls = readState().controls as DiveControls | null;
    const target = controls?.target ?? fallbackTarget.current;
    const from = readPose(camera.position, target);
    if (dive.direction === 'in') homeRef.current ??= from;
    if (dive.direction === 'out' && homeRef.current === null) return;
    if (controls) controls.enabled = false;
    activeRef.current = {
      bodyId: dive.bodyId,
      direction: dive.direction,
      durationSeconds: dive.durationSeconds,
      progress: 0,
      from,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useFrame(({ scene, size, invalidate, controls: sceneControls }, deltaSeconds) => {
    const controls = sceneControls as DiveControls | null;
    const active = activeRef.current;
    if (!active) return;

    const body = scene.getObjectByName(getBodySceneName(active.bodyId));
    const home = homeRef.current;
    const isGoingIn = active.direction === 'in';
    if (isGoingIn && !body) return;
    if (!isGoingIn && !home) return;

    const progress = advanceDiveProgress({
      progress: active.progress,
      deltaSeconds,
      durationSeconds: active.durationSeconds,
    });
    activeRef.current = { ...active, progress };
    const destination =
      isGoingIn && body
        ? getDiveEndPose({
            cameraPosition: active.from.position,
            bodyPosition: body.getWorldPosition(bodyPosition.current),
            distance: getFillDistance({
              radius: bodyRadius,
              fieldOfViewDegrees,
              aspect: size.width / size.height,
            }),
          })
        : home!;
    const pose = interpolatePose(active.from, destination, easeDive(progress));
    const target = controls?.target ?? fallbackTarget.current;
    camera.position.set(pose.position.x, pose.position.y, pose.position.z);
    target.set(pose.target.x, pose.target.y, pose.target.z);
    camera.lookAt(target);

    if (progress < 1) {
      invalidate();
      return;
    }
    activeRef.current = null;
    if (isGoingIn) return;
    homeRef.current = null;
    if (controls) {
      controls.enabled = true;
      controls.update();
    }
  });

  return null;
}
