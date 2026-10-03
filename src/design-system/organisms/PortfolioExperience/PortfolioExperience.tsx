'use client';

import { useRef } from 'react';
import type { ComponentType } from 'react';
import { credits } from '@/content/credits';
import { useBodyInteraction } from '@/hooks/use-body-interaction';
import { getBodyAccessibleLabel, getHintLabel } from '@/lib/body-labels';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { SolarSystemSceneLoader } from '@/scene/organisms/SolarSystemSceneLoader';
import { AttributionNote } from '../../molecules/AttributionNote/AttributionNote';
import { BodyHint } from '../../molecules/BodyHint/BodyHint';
import { SceneKeyboardControls } from '../../molecules/SceneKeyboardControls/SceneKeyboardControls';
import type { SceneKeyboardControlsHandle } from '../../molecules/SceneKeyboardControls/SceneKeyboardControls';
import { SectionView } from '../../molecules/SectionView/SectionView';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { QuickAccessMenu } from '../QuickAccessMenu/QuickAccessMenu';

export type SceneProps = {
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
};

type PortfolioExperienceProps = {
  bodies: readonly CelestialBodyConfig[];
  /** Injectable so the experience can run without WebGL (tests, fallback). */
  scene?: ComponentType<SceneProps>;
};

export function PortfolioExperience({
  bodies,
  scene: SceneComponent = SolarSystemSceneLoader,
}: PortfolioExperienceProps) {
  const keyboardControlsRef = useRef<SceneKeyboardControlsHandle>(null);
  const lastOpenedIdRef = useRef<string | null>(null);

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
  const menuItems = bodies.map((body) => ({ id: body.id, label: body.section.menuLabel }));
  const selectedBody = bodies.find((body) => body.id === interaction.state.selectedId);

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

  return (
    <>
      <div inert={selectedBody !== undefined} className="contents">
        <SceneComponent
          bodies={bodies}
          highlightOf={interaction.highlightOf}
          onHoverChange={changeHover}
          onSelect={openBody}
        />
        <SceneKeyboardControls
          ref={keyboardControlsRef}
          groupLabel="Corpos celestes"
          items={keyboardItems}
          onItemFocus={interaction.focus}
          onItemBlur={interaction.blur}
          onItemActivate={openBody}
        />
        <BodyHint label={getHintLabel(interaction.state, labeledBodies)} />
        <QuickAccessMenu items={menuItems} onSelectItem={openBody} />
      </div>
      <ContentPanel
        isOpen={selectedBody !== undefined}
        title={selectedBody?.section.title ?? ''}
        onClose={interaction.deselect}
        getFallbackFocus={focusLastOpenedBody}
      >
        {selectedBody && <SectionView content={selectedBody.section.content} />}
        <div className="mt-8 border-t border-border pt-4">
          <AttributionNote credits={credits} />
        </div>
      </ContentPanel>
    </>
  );
}
