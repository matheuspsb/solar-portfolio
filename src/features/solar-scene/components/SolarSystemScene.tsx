'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, lazy } from 'react';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { getFrameloop, getHighlightEasingRate, getRotationPeriodForMotion } from '../lib/motion';
import type { SceneQuality } from '../lib/scene-quality';
import { MIN_ZOOM_DISTANCE, getMaxZoomDistance } from '../lib/zoom';
import { CAMERA_FIELD_OF_VIEW } from '../constants';
import { CameraDistance } from './CameraDistance';
import { CameraViewOffset } from './CameraViewOffset';
import { KeyboardZoom } from './KeyboardZoom';
import { SceneLights } from './SceneLights';
import { StarField } from './StarField';
import { CelestialBody } from './CelestialBody';

// Slightly above the orbital plane so orbits read as ellipses instead of edge-on lines.
const CAMERA_POSITION: [number, number, number] = [0, 4, 9.5];
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 400;
const CONTROLS_DAMPING = 0.08;
// Keep the camera away from the poles, where an equirectangular texture pinches.
const MIN_POLAR_ANGLE = Math.PI * 0.2;
const MAX_POLAR_ANGLE = Math.PI * 0.8;

// Post-processing is the heaviest dependency; load it after the Sun is already on screen.
const SceneEffects = lazy(() =>
  import('./SceneEffects').then((module) => ({ default: module.SceneEffects })),
);

type SolarSystemSceneProps = {
  quality: SceneQuality;
  cameraDistance: number;
  viewOffsetPixels: number;
  viewOffsetEasingRate: number;
  prefersReducedMotion: boolean;
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  isActive: boolean;
  description: string;
};

export function SolarSystemScene({
  quality,
  cameraDistance,
  viewOffsetPixels,
  viewOffsetEasingRate,
  prefersReducedMotion,
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
  isActive,
  description,
}: SolarSystemSceneProps) {
  const maxZoomDistance = getMaxZoomDistance(cameraDistance);

  return (
    <Canvas
      role="img"
      aria-label={description}
      dpr={[1, quality.maxPixelRatio]}
      frameloop={getFrameloop({ prefersReducedMotion, isSceneActive: isActive })}
      camera={{
        position: CAMERA_POSITION,
        fov: CAMERA_FIELD_OF_VIEW,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          // preventDefault tells the browser we want the context back when it is available.
          event.preventDefault();
          onContextLost();
        });
        gl.domElement.addEventListener('webglcontextrestored', onContextRestored);
      }}
    >
      <color attach="background" args={[sceneTokens.backgroundColor]} />
      <CameraDistance distance={cameraDistance} />
      <CameraViewOffset targetOffsetPixels={viewOffsetPixels} easingRate={viewOffsetEasingRate} />
      <SceneLights />
      <StarField starCount={quality.starCount} />
      {bodies.map((body) => (
        <CelestialBody
          key={body.id}
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
        />
      ))}
      <Suspense fallback={null}>
        <SceneEffects />
      </Suspense>
      <KeyboardZoom
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={maxZoomDistance}
        isEnabled={isActive}
      />
      <OrbitControls
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
