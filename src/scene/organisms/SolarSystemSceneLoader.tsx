'use client';

import dynamic from 'next/dynamic';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { useIdleReady } from '@/hooks/use-idle-ready';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useViewportSize } from '@/hooks/use-viewport-size';
import { getSceneSettings } from '@/lib/scene-settings';
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
  description: string;
};

export function SolarSystemSceneLoader({
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
  isActive,
  description,
}: SolarSystemSceneLoaderProps) {
  const isIdle = useIdleReady();
  const viewport = useViewportSize();
  const prefersReducedMotion = usePrefersReducedMotion();
  const settings = getSceneSettings({
    bodyRadii: bodies.map((body) => body.radius),
    viewport,
    prefersReducedMotion,
    isPanelOpen: !isActive,
    panelWidthPixels: PANEL_WIDTH_PIXELS,
    fieldOfViewDegrees: CAMERA_FIELD_OF_VIEW,
    screenFill: BODY_SCREEN_FILL,
    panelShiftSeconds: PANEL_SHIFT_TRANSITION_SECONDS,
  });

  // The 3D bundle is large: wait until the content has painted and the browser is idle.
  if (!isIdle) return null;

  return (
    <SolarSystemScene
      quality={settings.quality}
      cameraDistance={settings.cameraDistance}
      viewOffsetPixels={settings.viewOffsetPixels}
      viewOffsetEasingRate={settings.viewOffsetEasingRate}
      prefersReducedMotion={prefersReducedMotion}
      bodies={bodies}
      highlightOf={highlightOf}
      onHoverChange={onHoverChange}
      onSelect={onSelect}
      onContextLost={onContextLost}
      onContextRestored={onContextRestored}
      isActive={isActive}
      description={description}
    />
  );
}
