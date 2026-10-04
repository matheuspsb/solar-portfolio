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
  /** Body to bring into view; `null` leaves the camera where the visitor put it. */
  targetId: string | null;
  /** Changes on every new focus request, even for the same body, so following resumes. */
  nonce: number;
  /** `Infinity` swings the camera instantly (reduced motion). */
  easingRate: number;
  homeAzimuth: number;
  sideOffset: number;
};

/**
 * Swings the camera around the center until the focused body is in front of the star, and keeps
 * following it as it orbits. Bodies are found by the `body-<id>` name given by `CelestialBody`.
 */
export function CameraFocus({
  targetId,
  nonce,
  easingRate,
  homeAzimuth,
  sideOffset,
}: CameraFocusProps) {
  const controls = useThree((state) => state.controls) as EventTarget | null;
  const hasTakenOverRef = useCameraTakeover(controls, nonce);

  useFrame(({ scene, camera, invalidate }, deltaSeconds) => {
    if (targetId === null || hasTakenOverRef.current) return;
    const body = scene.getObjectByName(getBodySceneName(targetId));
    if (!body) return;

    const targetAzimuth = getFocusAzimuth({ bodyPosition: body.position, homeAzimuth, sideOffset });
    const nextAzimuth = stepAngleToward({
      current: getAzimuth(camera.position),
      target: targetAzimuth,
      rate: easingRate,
      deltaSeconds,
    });
    const { x, y, z } = setAzimuth(camera.position, nextAzimuth);
    camera.position.set(x, y, z);

    // In on-demand mode nothing else asks for the next frame of the swing.
    if (Math.abs(wrapAngle(targetAzimuth - nextAzimuth)) > SETTLED_ANGLE_RADIANS) invalidate();
  });

  return null;
}
