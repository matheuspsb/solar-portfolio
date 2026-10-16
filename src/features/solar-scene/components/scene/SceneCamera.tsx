import { OrbitControls } from '@react-three/drei';
import { MIN_ZOOM_DISTANCE, getMaxZoomDistance } from '../../lib/zoom';
import { CAMERA_FIELD_OF_VIEW, CAMERA_FOCUS_SIDE_OFFSET_RADIANS } from '../../constants';
import type { DiveRequest } from '../../types';
import { CameraDistance } from '../camera/CameraDistance';
import { CameraDive } from '../camera/CameraDive';
import { CameraFocus } from '../camera/CameraFocus';
import { CameraViewOffset } from '../camera/CameraViewOffset';
import { KeyboardZoom } from '../camera/KeyboardZoom';

const CONTROLS_DAMPING = 0.08;
const MIN_POLAR_ANGLE = Math.PI * 0.2;
const MAX_POLAR_ANGLE = Math.PI * 0.8;

type SceneCameraProps = {
  cameraDistance: number;
  cameraTarget: { id: string | null; nonce: number };
  cameraFocusEasingRate: number;
  viewOffsetPixels: number;
  viewOffsetEasingRate: number;
  dive: DiveRequest | null;
  diveBodyRadius: number;
  isActive: boolean;
  prefersReducedMotion: boolean;
};

export function SceneCamera({
  cameraDistance,
  cameraTarget,
  cameraFocusEasingRate,
  viewOffsetPixels,
  viewOffsetEasingRate,
  dive,
  diveBodyRadius,
  isActive,
  prefersReducedMotion,
}: SceneCameraProps) {
  const maxZoomDistance = getMaxZoomDistance(cameraDistance);

  return (
    <>
      <CameraDistance distance={cameraDistance} />
      <CameraFocus
        targetId={cameraTarget.id}
        nonce={cameraTarget.nonce}
        easingRate={cameraFocusEasingRate}
        sideOffset={CAMERA_FOCUS_SIDE_OFFSET_RADIANS}
      />
      <CameraDive
        dive={dive}
        bodyRadius={diveBodyRadius}
        fieldOfViewDegrees={CAMERA_FIELD_OF_VIEW}
      />
      <CameraViewOffset targetOffsetPixels={viewOffsetPixels} easingRate={viewOffsetEasingRate} />
      <KeyboardZoom
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={maxZoomDistance}
        isEnabled={isActive}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={MIN_POLAR_ANGLE}
        maxPolarAngle={MAX_POLAR_ANGLE}
        enableDamping={!prefersReducedMotion}
        dampingFactor={CONTROLS_DAMPING}
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={maxZoomDistance}
      />
    </>
  );
}
