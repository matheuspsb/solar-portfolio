'use client';

import dynamic from 'next/dynamic';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { useIdleReady } from '@/hooks/use-idle-ready';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useViewportSize } from '@/hooks/use-viewport-size';
import { getFramingDistance } from '@/lib/camera-framing';
import { getTransitionRate, getTransitionSeconds } from '@/lib/motion';
import { getPanelViewOffsetPixels } from '@/lib/panel-offset';
import { getSceneQuality } from '@/lib/scene-quality';
import {
  BODY_SCREEN_FILL,
  CAMERA_FIELD_OF_VIEW,
  PANEL_SHIFT_TRANSITION_SECONDS,
  PANEL_WIDTH_PIXELS,
} from '../scene-constants';

const SolarSystemScene = dynamic(
  () => import('./SolarSystemScene').then((module) => module.SolarSystemScene),
  { ssr: false },
);

type SolarSystemSceneLoaderProps = {
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  isActive: boolean;
};

export function SolarSystemSceneLoader({
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
  isActive,
}: SolarSystemSceneLoaderProps) {
  const isIdle = useIdleReady();
  const { width, height } = useViewportSize();
  const prefersReducedMotion = usePrefersReducedMotion();
  const quality = getSceneQuality(width);
  const cameraDistance = getFramingDistance({
    radius: Math.max(...bodies.map((body) => body.radius)),
    fieldOfViewDegrees: CAMERA_FIELD_OF_VIEW,
    aspectRatio: width / height,
    screenFill: BODY_SCREEN_FILL,
  });
  const viewOffsetPixels = getPanelViewOffsetPixels({
    viewportWidth: width,
    panelWidthPixels: PANEL_WIDTH_PIXELS,
    isPanelOpen: !isActive,
  });
  const viewOffsetEasingRate = getTransitionRate(
    getTransitionSeconds(PANEL_SHIFT_TRANSITION_SECONDS, prefersReducedMotion),
  );

  // The 3D bundle is large: wait until the content has painted and the browser is idle.
  if (!isIdle) return null;

  return (
    <SolarSystemScene
      quality={quality}
      cameraDistance={cameraDistance}
      viewOffsetPixels={viewOffsetPixels}
      viewOffsetEasingRate={viewOffsetEasingRate}
      prefersReducedMotion={prefersReducedMotion}
      bodies={bodies}
      highlightOf={highlightOf}
      onHoverChange={onHoverChange}
      onSelect={onSelect}
      onContextLost={onContextLost}
      onContextRestored={onContextRestored}
      isActive={isActive}
    />
  );
}
