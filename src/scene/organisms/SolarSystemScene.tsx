'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { sceneTokens } from '@/design-system/tokens/scene-tokens';
import type { SceneQuality } from '@/lib/scene-quality';
import { SceneLights } from '../atoms/SceneLights';
import { StarField } from '../atoms/StarField';

const CAMERA_POSITION: [number, number, number] = [0, 1.5, 11];
const CAMERA_FIELD_OF_VIEW = 50;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 400;
const MIN_ZOOM_DISTANCE = 5;
const MAX_ZOOM_DISTANCE = 22;
const CONTROLS_DAMPING = 0.08;

type SolarSystemSceneProps = {
  quality: SceneQuality;
  children?: ReactNode;
};

export function SolarSystemScene({ quality, children }: SolarSystemSceneProps) {
  return (
    <Canvas
      dpr={[1, quality.maxPixelRatio]}
      camera={{
        position: CAMERA_POSITION,
        fov: CAMERA_FIELD_OF_VIEW,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={[sceneTokens.backgroundColor]} />
      <SceneLights />
      <StarField starCount={quality.starCount} />
      {children}
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={CONTROLS_DAMPING}
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={MAX_ZOOM_DISTANCE}
      />
    </Canvas>
  );
}
