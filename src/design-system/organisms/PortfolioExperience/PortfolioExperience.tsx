'use client';

import { useBodyInteraction } from '@/hooks/use-body-interaction';
import { getBodyAccessibleLabel, getHintLabel } from '@/lib/body-labels';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import { SolarSystemSceneLoader } from '@/scene/organisms/SolarSystemSceneLoader';
import { BodyHint } from '../../molecules/BodyHint/BodyHint';
import { SceneKeyboardControls } from '../../molecules/SceneKeyboardControls/SceneKeyboardControls';

type PortfolioExperienceProps = {
  bodies: readonly CelestialBodyConfig[];
};

export function PortfolioExperience({ bodies }: PortfolioExperienceProps) {
  const labeledBodies = bodies.map((body) => ({
    id: body.id,
    name: body.name,
    menuLabel: body.section.menuLabel,
  }));
  const interaction = useBodyInteraction(labeledBodies.map((body) => body.id));
  const keyboardItems = labeledBodies.map((body) => ({
    id: body.id,
    label: getBodyAccessibleLabel(body),
  }));

  const changeHover = (id: string, isHovered: boolean) => {
    if (isHovered) interaction.hover(id);
    else interaction.unhover(id);
  };

  return (
    <>
      <SolarSystemSceneLoader
        bodies={bodies}
        highlightOf={interaction.highlightOf}
        onHoverChange={changeHover}
        onSelect={interaction.select}
      />
      <SceneKeyboardControls
        groupLabel="Corpos celestes"
        items={keyboardItems}
        onItemFocus={interaction.focus}
        onItemBlur={interaction.blur}
        onItemActivate={interaction.select}
      />
      <BodyHint label={getHintLabel(interaction.state, labeledBodies)} />
    </>
  );
}
