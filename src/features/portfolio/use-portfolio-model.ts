import { useRef } from 'react';
import { getInteractiveBodies } from '@/domain/celestial-body';
import type { CelestialBodyConfig } from '@/domain/celestial-body';
import { getBodyAccessibleLabel } from './body-labels';
import { buildLockTargets } from './lock-targets';
import { getOpenExperience, getOpenPanel } from './open-section';
import type { SceneKeyboardControlsHandle } from './SceneKeyboardControls';
import { getTrackedBodyId } from './tracked-body';
import { useBodyInteraction } from './use-body-interaction';
import { useCameraTarget } from './use-camera-target';

export function usePortfolioModel(bodies: readonly CelestialBodyConfig[]) {
  const keyboardControlsRef = useRef<SceneKeyboardControlsHandle>(null);
  const lastOpenedIdRef = useRef<string | null>(null);

  const interactiveBodies = getInteractiveBodies(bodies);
  const labeledBodies = interactiveBodies.map((body) => ({
    id: body.id,
    name: body.name,
    menuLabel: body.section.menuLabel,
    presentation: body.section.presentation,
  }));
  const interaction = useBodyInteraction(labeledBodies.map((body) => body.id));
  const selectedBody = interactiveBodies.find((body) => body.id === interaction.state.selectedId);

  const changeHover = (id: string, isHovered: boolean) => {
    if (isHovered) interaction.hover(id);
    else interaction.unhover(id);
  };

  const openBody = (id: string) => {
    lastOpenedIdRef.current = id;
    interaction.select(id);
  };

  const focusLastOpenedBody = () => {
    const lastOpenedId = lastOpenedIdRef.current;
    if (lastOpenedId === null) return null;
    return keyboardControlsRef.current?.focusItem(lastOpenedId) ?? null;
  };

  const model = {
    keyboardItems: labeledBodies.map((body) => ({
      id: body.id,
      label: getBodyAccessibleLabel(body),
    })),
    menuItems: interactiveBodies.map((body) => ({
      id: body.id,
      label: body.section.menuLabel,
      tone: body.section.menuTone,
    })),
    lockTargets: buildLockTargets(interactiveBodies),
    selectedBody,
    openPanel: getOpenPanel(selectedBody),
    openExperience: getOpenExperience(selectedBody),
    trackedBodyId: getTrackedBodyId(interaction.state),
    cameraTarget: useCameraTarget(interaction.state.selectedId ?? interaction.state.focusedId),
    highlightOf: interaction.highlightOf,
    focusBody: interaction.focus,
    blurBody: interaction.blur,
    deselect: interaction.deselect,
    changeHover,
    openBody,
    focusLastOpenedBody,
  };

  return { keyboardControlsRef, model };
}
