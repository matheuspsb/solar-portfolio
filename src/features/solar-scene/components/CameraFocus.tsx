import { useFrame, useThree } from '@react-three/fiber';
import { useCameraTakeover } from '../hooks/use-camera-takeover';
import { getBodySceneName } from '../lib/body-scene-name';
import {
  getAzimuth,
  getFocusAzimuth,
  setAzimuth,
  stepAngleToward,
  wrapAngle,
} from '../lib/camera-focus';

const SETTLED_ANGLE_RADIANS = 0.002;

type CameraFocusProps = {
  targetId: string | null;
  nonce: number;
  easingRate: number;
  sideOffset: number;
};

export function CameraFocus({ targetId, nonce, easingRate, sideOffset }: CameraFocusProps) {
  const controls = useThree((state) => state.controls) as EventTarget | null;
  const hasTakenOverRef = useCameraTakeover(controls, nonce);

  useFrame(({ scene, camera, invalidate }, deltaSeconds) => {
    if (targetId === null || hasTakenOverRef.current) return;
    const body = scene.getObjectByName(getBodySceneName(targetId));
    if (!body) return;

    const targetAzimuth = getFocusAzimuth({ bodyPosition: body.position, sideOffset });
    if (targetAzimuth === null) return;
    const nextAzimuth = stepAngleToward({
      current: getAzimuth(camera.position),
      target: targetAzimuth,
      rate: easingRate,
      deltaSeconds,
    });
    const { x, y, z } = setAzimuth(camera.position, nextAzimuth);
    camera.position.set(x, y, z);

    if (Math.abs(wrapAngle(targetAzimuth - nextAzimuth)) > SETTLED_ANGLE_RADIANS) invalidate();
  });

  return null;
}
