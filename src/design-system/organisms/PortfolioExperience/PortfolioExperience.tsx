'use client';

import { useRef } from 'react';
import type { ComponentType } from 'react';
import { useBodyInteraction } from '@/hooks/use-body-interaction';
import { useSceneAvailability } from '@/hooks/use-scene-availability';
import type { SceneStatus } from '@/hooks/use-scene-availability';
import { getBodyAccessibleLabel, getHintLabel } from '@/lib/body-labels';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Highlight } from '@/lib/interaction-state';
import { detectWebGL } from '@/lib/webgl-support';
import { SceneErrorBoundary } from '@/scene/organisms/SceneErrorBoundary';
import { SolarSystemSceneLoader } from '@/scene/organisms/SolarSystemSceneLoader';
import { AttributionNote } from '../../molecules/AttributionNote/AttributionNote';
import type { Credit } from '../../molecules/AttributionNote/AttributionNote';
import { BodyHint } from '../../molecules/BodyHint/BodyHint';
import { SceneKeyboardControls } from '../../molecules/SceneKeyboardControls/SceneKeyboardControls';
import type { SceneKeyboardControlsHandle } from '../../molecules/SceneKeyboardControls/SceneKeyboardControls';
import { SceneFallback } from '../../molecules/SceneFallback/SceneFallback';
import { SectionView } from '../../molecules/SectionView/SectionView';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { QuickAccessMenu } from '../QuickAccessMenu/QuickAccessMenu';

export type SceneProps = {
  bodies: readonly CelestialBodyConfig[];
  highlightOf: (id: string) => Highlight;
  onHoverChange: (id: string, isHovered: boolean) => void;
  onSelect: (id: string) => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  /** False while the content panel covers the scene, so it can stop its idle render loop. */
  isActive: boolean;
  /** Text alternative for the canvas, announced by assistive technology. */
  description: string;
};

type PortfolioExperienceProps = {
  bodies: readonly CelestialBodyConfig[];
  credits: readonly Credit[];
  sceneDescription: string;
  /** Injectable so the experience can run without WebGL (tests, fallback). */
  scene?: ComponentType<SceneProps>;
  /** Injectable WebGL probe, for tests. */
  detectWebGL?: () => boolean;
};

const UNAVAILABLE_MESSAGE =
  'Não foi possível exibir a cena 3D neste dispositivo. O conteúdo continua disponível pelo menu de acesso rápido e pelos botões abaixo.';
const CONTEXT_LOST_MESSAGE = 'A cena 3D perdeu o contexto gráfico e está tentando se recuperar.';
const FALLBACK_TITLE = 'Visualização 3D indisponível';

const fallbackMessageByStatus: Record<SceneStatus, string | null> = {
  working: null,
  contextLost: CONTEXT_LOST_MESSAGE,
  unavailable: UNAVAILABLE_MESSAGE,
};

export function PortfolioExperience({
  bodies,
  credits,
  sceneDescription,
  scene: SceneComponent = SolarSystemSceneLoader,
  detectWebGL: probeWebGL = detectWebGL,
}: PortfolioExperienceProps) {
  const availability = useSceneAvailability(probeWebGL);
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
  const fallbackMessage = fallbackMessageByStatus[availability.status];
  const retryHandler = availability.canRetry ? availability.retry : undefined;
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
        <SceneErrorBoundary
          fallback={null}
          resetKey={availability.resetKey}
          onError={availability.markCrashed}
        >
          {availability.status !== 'unavailable' && (
            <SceneComponent
              bodies={bodies}
              highlightOf={interaction.highlightOf}
              onHoverChange={changeHover}
              onSelect={openBody}
              onContextLost={availability.markContextLost}
              onContextRestored={availability.markContextRestored}
              isActive={selectedBody === undefined}
              description={sceneDescription}
            />
          )}
        </SceneErrorBoundary>
        {fallbackMessage && (
          <SceneFallback
            title={FALLBACK_TITLE}
            message={fallbackMessage}
            items={menuItems}
            onSelectItem={openBody}
            onRetry={retryHandler}
          />
        )}
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
