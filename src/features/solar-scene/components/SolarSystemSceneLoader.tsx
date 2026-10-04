'use client';

import dynamic from 'next/dynamic';
import { useIdleReady } from '@/hooks/use-idle-ready';
import { useViewportSize } from '@/hooks/use-viewport-size';
import type { SceneProps } from '../types';
import { usePrefersReducedMotion } from '../hooks/use-prefers-reduced-motion';

import { getBodyExtent } from '../lib/body-extent';
import { getSceneSettings } from '../lib/scene-settings';
import {
  SYSTEM_SCREEN_FILL,
  CAMERA_FIELD_OF_VIEW,
  CAMERA_FOCUS_TRANSITION_SECONDS,
  PANEL_SHIFT_TRANSITION_SECONDS,
  PANEL_WIDTH_PIXELS,
} from '../constants';

const SolarSystemScene = dynamic(
  () => import('./SolarSystemScene').then((module) => module.SolarSystemScene),
  { ssr: false },
);

export function SolarSystemSceneLoader({
  bodies,
  highlightOf,
  onHoverChange,
  onSelect,
  onContextLost,
  onContextRestored,
  isActive,
  cameraTarget,
  description,
}: SceneProps) {
  const isIdle = useIdleReady();
  const viewport = useViewportSize();
  const prefersReducedMotion = usePrefersReducedMotion();
  const settings = getSceneSettings({
    bodyExtents: bodies.map(getBodyExtent),
    viewport,
    prefersReducedMotion,
    isPanelOpen: !isActive,
    panelWidthPixels: PANEL_WIDTH_PIXELS,
    fieldOfViewDegrees: CAMERA_FIELD_OF_VIEW,
    screenFill: SYSTEM_SCREEN_FILL,
    panelShiftSeconds: PANEL_SHIFT_TRANSITION_SECONDS,
    cameraFocusSeconds: CAMERA_FOCUS_TRANSITION_SECONDS,
  });

  if (!isIdle) return null;

  return (
    <SolarSystemScene
      quality={settings.quality}
      cameraDistance={settings.cameraDistance}
      viewOffsetPixels={settings.viewOffsetPixels}
      viewOffsetEasingRate={settings.viewOffsetEasingRate}
      cameraFocusEasingRate={settings.cameraFocusEasingRate}
      cameraTarget={cameraTarget}
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
