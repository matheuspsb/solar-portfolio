'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, lazy } from 'react';
import { sceneTokens } from '@/styles/scene-tokens';
import type { CelestialBodyConfig } from '@/domain/celestial-body';
import type { Highlight } from '@/domain/interaction-state';
import {
  getFrameloop,
  getHighlightEasingRate,
  getRotationPeriodForMotion,
  getTrackerEasingRate,
} from '../lib/motion';
import type { SceneQuality } from '../lib/scene-quality';
import { MIN_ZOOM_DISTANCE, getMaxZoomDistance } from '../lib/zoom';
import {
  CAMERA_FIELD_OF_VIEW,
  CAMERA_FOCUS_SIDE_OFFSET_RADIANS,
  SCENE_REVEAL_MAX_WAIT_MS,
} from '../constants';
import { useSceneReveal } from '../hooks/use-scene-reveal';
import type { SceneProps } from '../types';
import { BodyTracker } from './BodyTracker';
import { CameraDistance } from './CameraDistance';
import { CameraFocus } from './CameraFocus';
import { CameraViewOffset } from './CameraViewOffset';
import { KeyboardZoom } from './KeyboardZoom';
import { SceneLights } from './SceneLights';
import { StarField } from './StarField';
import { CelestialBody } from './CelestialBody';

const CAMERA_POSITION: [number, number, number] = [0, 4, 9.5];
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 400;
const CONTROLS_DAMPING = 0.08;
const MIN_POLAR_ANGLE = Math.PI * 0.2;
const MAX_POLAR_ANGLE = Math.PI * 0.8;

const SceneEffects = lazy(() =>
  import('./SceneEffects').then((module) => ({ default: module.SceneEffects })),
);

type SolarSystemSceneProps = {
  quality: SceneQuality;
  cameraDistance: number;
  viewOffsetPixels: number;
  viewOffsetEasingRate: number;
  cameraFocusEasingRate: number;
  cameraTarget: SceneProps['cameraTarget'];
  prefersReducedMotion: boolean;
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  isActive: boolean;
  description: string;
  trackedBodyId: string | null;
  onTrackFrame: SceneProps['onTrackFrame'];
};

export function SolarSystemScene({
  quality,
  cameraDistance,
  viewOffsetPixels,
  viewOffsetEasingRate,
  cameraFocusEasingRate,
  cameraTarget,
  prefersReducedMotion,
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
  isActive,
  description,
  trackedBodyId,
  onTrackFrame,
}: SolarSystemSceneProps) {
  const maxZoomDistance = getMaxZoomDistance(cameraDistance);
  const reveal = useSceneReveal({
    bodyIds: bodies.map((body) => body.id),
    maxWaitMs: SCENE_REVEAL_MAX_WAIT_MS,
  });
  const clearHover = () => {
    for (const body of bodies) {
      if (highlightOf(body.id) === 'hovered') onHoverChange(body.id, false);
    }
  };

  return (
    <Canvas
      role="img"
      aria-label={description}
      className={`transition-opacity duration-slow ${reveal.isRevealed ? 'opacity-100' : 'opacity-0'}`}
      dpr={[1, quality.maxPixelRatio]}
      frameloop={getFrameloop(prefersReducedMotion)}
      camera={{
        position: CAMERA_POSITION,
        fov: CAMERA_FIELD_OF_VIEW,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={clearHover}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          onContextLost();
        });
        gl.domElement.addEventListener('webglcontextrestored', onContextRestored);
      }}
    >
      <color attach="background" args={[sceneTokens.backgroundColor]} />
      <CameraDistance distance={cameraDistance} />
      <CameraFocus
        targetId={cameraTarget.id}
        nonce={cameraTarget.nonce}
        easingRate={cameraFocusEasingRate}
        sideOffset={CAMERA_FOCUS_SIDE_OFFSET_RADIANS}
      />
      <CameraViewOffset targetOffsetPixels={viewOffsetPixels} easingRate={viewOffsetEasingRate} />
      <BodyTracker
        targetId={trackedBodyId}
        bodies={bodies}
        easingRate={getTrackerEasingRate(prefersReducedMotion)}
        onFrame={onTrackFrame}
      />
      <SceneLights />
      <StarField starCount={quality.starCount} />
      {bodies.map((body) => (
        <CelestialBody
          key={body.id}
          id={body.id}
          kind={body.kind}
          orbit={body.orbit}
          radius={body.radius}
          texture={body.texture}
          prefersSmallTexture={quality.tier === 'low'}
          rotationPeriodSeconds={getRotationPeriodForMotion(
            body.rotationPeriodSeconds,
            prefersReducedMotion,
          )}
          isAnimated={!prefersReducedMotion}
          highlight={highlightOf(body.id)}
          highlightEasingRate={getHighlightEasingRate(prefersReducedMotion)}
          onHoverChange={(isHovered) => onHoverChange(body.id, isHovered)}
          onSelect={() => onSelect(body.id)}
          onSettled={reveal.markBodySettled}
        />
      ))}
      <Suspense fallback={null}>
        <SceneEffects onReady={reveal.markEffectsReady} />
      </Suspense>
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
    </Canvas>
  );
}
