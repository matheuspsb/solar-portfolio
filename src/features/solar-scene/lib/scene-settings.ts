import { getFramingDistance } from './camera-framing';
import { getTransitionRate, getTransitionSeconds } from './motion';
import { getPanelViewOffsetPixels } from './panel-offset';
import { getSceneQuality } from './scene-quality';
import type { SceneQuality } from './scene-quality';

type SceneSettingsInput = {
  bodyExtents: readonly number[];
  viewport: { width: number; height: number };
  prefersReducedMotion: boolean;
  isPanelOpen: boolean;
  panelWidthPixels: number;
  fieldOfViewDegrees: number;
  screenFill: number;
  panelShiftSeconds: number;
  cameraFocusSeconds: number;
};

export type SceneSettings = {
  quality: SceneQuality;
  cameraDistance: number;
  viewOffsetPixels: number;
  viewOffsetEasingRate: number;
  cameraFocusEasingRate: number;
};

export function getSceneSettings(input: SceneSettingsInput): SceneSettings {
  const { width, height } = input.viewport;
  return {
    quality: getSceneQuality(width),
    cameraDistance: getFramingDistance({
      radius: Math.max(...input.bodyExtents),
      fieldOfViewDegrees: input.fieldOfViewDegrees,
      aspectRatio: width / height,
      screenFill: input.screenFill,
    }),
    viewOffsetPixels: getPanelViewOffsetPixels({
      viewportWidth: width,
      panelWidthPixels: input.panelWidthPixels,
      isPanelOpen: input.isPanelOpen,
    }),
    viewOffsetEasingRate: getTransitionRate(
      getTransitionSeconds(input.panelShiftSeconds, input.prefersReducedMotion),
    ),
    cameraFocusEasingRate: getTransitionRate(
      getTransitionSeconds(input.cameraFocusSeconds, input.prefersReducedMotion),
    ),
  };
}
