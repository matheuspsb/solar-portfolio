'use client';

import { useRef } from 'react';
import type { ComponentType } from 'react';
import { AttributionNote, ContentPanel, SectionView } from '@/features/content-panel';
import { QuickAccessMenu } from '@/features/quick-access-menu';
import {
  SceneErrorBoundary,
  SolarSystemSceneLoader,
  detectWebGL,
  useSceneAvailability,
} from '@/features/solar-scene';
import type { SceneProps, SceneStatus } from '@/features/solar-scene';
import type { IdleScheduler } from '@/hooks/use-idle-ready';
import type { CelestialBodyConfig } from '@/lib/celestial-body';
import type { Credit } from '@/lib/credit';
import { getBodyAccessibleLabel, getHintLabel } from './body-labels';
import { BodyHint } from './BodyHint';
import { SceneFallback } from './SceneFallback';
import { SceneKeyboardControls } from './SceneKeyboardControls';
import type { SceneKeyboardControlsHandle } from './SceneKeyboardControls';
import { useBodyInteraction } from './use-body-interaction';

type PortfolioExperienceProps = {
  bodies: readonly CelestialBodyConfig[];
  credits: readonly Credit[];
  sceneDescription: string;
  /** Injectable so the experience can run without WebGL (tests, fallback). */
  scene?: ComponentType<SceneProps>;
  /** Injectable WebGL probe, for tests. */
  detectWebGL?: () => boolean;
  /** Injectable idle scheduler (the probe waits for the browser to be idle), for tests. */
  idleScheduler?: IdleScheduler;
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
  idleScheduler,
}: PortfolioExperienceProps) {
  const availability = useSceneAvailability(probeWebGL, idleScheduler);
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
  const menuItems = bodies.map((body) => ({
    id: body.id,
    label: body.section.menuLabel,
    tone: body.section.menuTone,
  }));
  const fallbackMessage = fallbackMessageByStatus[availability.status];
  const canMountScene = availability.isChecked && availability.status !== 'unavailable';
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
          {canMountScene && (
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
        panelLabel={selectedBody?.section.panelLabel ?? ''}
        onClose={interaction.deselect}
        getFallbackFocus={focusLastOpenedBody}
        footer={<AttributionNote credits={credits} />}
      >
        {selectedBody && (
          <SectionView
            content={selectedBody.section.content}
            emblemTextureUrl={selectedBody.texture?.smallUrl ?? null}
          />
        )}
      </ContentPanel>
    </>
  );
}
