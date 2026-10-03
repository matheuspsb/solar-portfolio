'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, lazy } from 'react';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { getFrameloop, getHighlightEasingRate, getRotationPeriodForMotion } from '@/lib/motion';
import type { SceneQuality } from '@/lib/scene-quality';
import { CAMERA_FIELD_OF_VIEW } from '../scene-constants';
import { CameraDistance } from '../atoms/CameraDistance';
import { SceneLights } from '../atoms/SceneLights';
import { StarField } from '../atoms/StarField';
import { CelestialBody } from '../molecules/CelestialBody';

const CAMERA_POSITION: [number, number, number] = [0, 1.5, 11];
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 400;
const MIN_ZOOM_DISTANCE = 5;
const MAX_ZOOM_DISTANCE = 22;
const CONTROLS_DAMPING = 0.08;
const MAX_DISTANCE_MARGIN = 1.5;

// Post-processing is the heaviest dependency; load it after the Sun is already on screen.
const SceneEffects = lazy(() =>
  import('../atoms/SceneEffects').then((module) => ({ default: module.SceneEffects })),
);

type SolarSystemSceneProps = {
  quality: SceneQuality;
  cameraDistance: number;
  prefersReducedMotion: boolean;
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  isActive: boolean;
};

export function SolarSystemScene({
  quality,
  cameraDistance,
  prefersReducedMotion,
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
  isActive,
}: SolarSystemSceneProps) {
  return (
    <Canvas
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
      <SceneLights />
      <StarField starCount={quality.starCount} />
      {bodies.map((body) => (
        <CelestialBody
          key={body.id}
          radius={body.radius}
          texture={body.texture}
          prefersSmallTexture={quality.tier === 'low'}
          rotationPeriodSeconds={getRotationPeriodForMotion(
            body.rotationPeriodSeconds,
            prefersReducedMotion,
          )}
          highlight={highlightOf(body.id)}
          highlightEasingRate={getHighlightEasingRate(prefersReducedMotion)}
          onHoverChange={(isHovered) => onHoverChange(body.id, isHovered)}
          onSelect={() => onSelect(body.id)}
        />
      ))}
      <Suspense fallback={null}>
        <SceneEffects />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableDamping={!prefersReducedMotion}
        dampingFactor={CONTROLS_DAMPING}
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={Math.max(MAX_ZOOM_DISTANCE, cameraDistance * MAX_DISTANCE_MARGIN)}
      />
    </Canvas>
  );
}
