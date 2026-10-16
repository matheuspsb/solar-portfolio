'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, lazy } from 'react';
import { sceneTokens } from '@/styles/scene-tokens';
import { getFrameloop, getTrackerEasingRate } from '../../lib/motion';
import type { SceneSettings } from '../../lib/scene-settings';
import { CAMERA_FIELD_OF_VIEW, SCENE_REVEAL_MAX_WAIT_MS } from '../../constants';
import { useSceneReveal } from '../../hooks/use-scene-reveal';
import type { SceneProps } from '../../types';
import { BodyTracker } from './BodyTracker';
import { SceneBodies } from './SceneBodies';
import { SceneCamera } from './SceneCamera';
import { SceneLights } from './SceneLights';
import { StarField } from './StarField';
import { WebglContextEvents } from './WebglContextEvents';

const CAMERA_POSITION: [number, number, number] = [0, 4, 9.5];
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 400;

const SceneEffects = lazy(() =>
  import('./SceneEffects').then((module) => ({ default: module.SceneEffects })),
);

type SolarSystemSceneProps = SceneProps &
  SceneSettings & {
    prefersReducedMotion: boolean;
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
  isHidden,
  description,
  trackedBodyId,
  onTrackFrame,
  onRevealChange,
  dive = null,
}: SolarSystemSceneProps) {
  const diveBodyRadius = bodies.find((body) => body.id === dive?.bodyId)?.radius ?? 0;
  const reveal = useSceneReveal({
    bodyIds: bodies.map((body) => body.id),
    maxWaitMs: SCENE_REVEAL_MAX_WAIT_MS,
    onRevealChange,
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
      frameloop={getFrameloop({ prefersReducedMotion, isHidden })}
      camera={{
        position: CAMERA_POSITION,
        fov: CAMERA_FIELD_OF_VIEW,
        near: CAMERA_NEAR,
        far: CAMERA_FAR,
      }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={clearHover}
    >
      <color attach="background" args={[sceneTokens.backgroundColor]} />
      <WebglContextEvents onLost={onContextLost} onRestored={onContextRestored} />
      <SceneCamera
        cameraDistance={cameraDistance}
        cameraTarget={cameraTarget}
        cameraFocusEasingRate={cameraFocusEasingRate}
        viewOffsetPixels={viewOffsetPixels}
        viewOffsetEasingRate={viewOffsetEasingRate}
        dive={dive}
        diveBodyRadius={diveBodyRadius}
        isActive={isActive}
        prefersReducedMotion={prefersReducedMotion}
      />
      <BodyTracker
        targetId={trackedBodyId}
        bodies={bodies}
        easingRate={getTrackerEasingRate(prefersReducedMotion)}
        onFrame={onTrackFrame}
      />
      <SceneLights />
      <StarField starCount={quality.starCount} />
      <SceneBodies
        bodies={bodies}
        prefersSmallTexture={quality.tier === 'low'}
        highlightOf={highlightOf}
        onHoverChange={onHoverChange}
        onSelect={onSelect}
        prefersReducedMotion={prefersReducedMotion}
        onBodySettled={reveal.markBodySettled}
      />
      <Suspense fallback={null}>
        <SceneEffects onReady={reveal.markEffectsReady} />
      </Suspense>
    </Canvas>
  );
}
