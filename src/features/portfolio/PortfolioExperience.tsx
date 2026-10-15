'use client';

import type { ComponentType } from 'react';
import { AttributionNote, ContentPanel } from '@/features/content-panel';
import { LoadingGate } from '@/features/loading-screen';
import { QuickAccessMenu } from '@/features/quick-access-menu';
import { SceneErrorBoundary, SolarSystemSceneLoader, detectWebGL } from '@/features/solar-scene';
import type { SceneProps } from '@/features/solar-scene';
import { TargetLock } from '@/features/target-lock';
import { uiContent } from '@/content/ui';
import type { CelestialBodyConfig } from '@/domain/celestial-body';
import type { Credit } from '@/domain/credit';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { IdleScheduler } from '@/hooks/use-idle-ready';
import { ImmersiveView } from './ImmersiveView';
import { getImmersiveTarget } from './open-section';
import { SceneFallback } from './SceneFallback';
import { SceneKeyboardControls } from './SceneKeyboardControls';
import { SectionView } from './SectionView';
import { useImmersiveStage } from './use-immersive-stage';
import { usePortfolioModel } from './use-portfolio-model';
import { useSceneShell } from './use-scene-shell';

type ImmersiveTransition = { diveSeconds: number; surfaceSeconds: number };

type PortfolioExperienceProps = {
  bodies: readonly CelestialBodyConfig[];
  credits: readonly Credit[];
  sceneDescription: string;
  scene?: ComponentType<SceneProps>;
  detectWebGL?: () => boolean;
  idleScheduler?: IdleScheduler;
  loaderScheduler?: FrameScheduler;
  immersiveTransition?: ImmersiveTransition;
};

const DEFAULT_IMMERSIVE_TRANSITION: ImmersiveTransition = { diveSeconds: 1.7, surfaceSeconds: 1.1 };

export function PortfolioExperience({
  bodies,
  credits,
  sceneDescription,
  scene: SceneComponent = SolarSystemSceneLoader,
  detectWebGL: probeWebGL = detectWebGL,
  idleScheduler,
  loaderScheduler,
  immersiveTransition = DEFAULT_IMMERSIVE_TRANSITION,
}: PortfolioExperienceProps) {
  const { keyboardControlsRef, model } = usePortfolioModel(bodies);
  const shell = useSceneShell({ probeWebGL, idleScheduler });
  const prefersReducedMotion = usePrefersReducedMotion();
  const skipsImmersiveTransition = prefersReducedMotion || immersiveTransition.diveSeconds <= 0;
  const immersive = useImmersiveStage({
    target: getImmersiveTarget(model.selectedBody),
    reducedMotion: skipsImmersiveTransition,
    diveSeconds: immersiveTransition.diveSeconds,
    surfaceSeconds: immersiveTransition.surfaceSeconds,
  });
  const sceneCameraTarget =
    immersive.stage === 'idle' ? model.cameraTarget : { ...model.cameraTarget, id: null };
  const isBodyOpen = model.selectedBody !== undefined;

  return (
    <>
      <LoadingGate isSceneReady={shell.isSceneReady} scheduler={loaderScheduler} />
      <div inert={isBodyOpen} className="contents">
        <SceneErrorBoundary
          fallback={null}
          resetKey={shell.availability.resetKey}
          onError={shell.availability.markCrashed}
        >
          {shell.canMountScene && (
            <SceneComponent
              bodies={bodies}
              highlightOf={model.highlightOf}
              onHoverChange={model.changeHover}
              onSelect={model.openBody}
              onContextLost={shell.availability.markContextLost}
              onContextRestored={shell.availability.markContextRestored}
              isActive={!isBodyOpen}
              isHidden={immersive.stage === 'open'}
              cameraTarget={sceneCameraTarget}
              dive={immersive.dive}
              description={sceneDescription}
              trackedBodyId={model.trackedBodyId}
              onTrackFrame={shell.frameChannel.publish}
              onRevealChange={shell.setIsSceneRevealed}
            />
          )}
        </SceneErrorBoundary>
        {shell.fallbackMessage && (
          <SceneFallback
            title={uiContent.sceneFallback.title}
            message={shell.fallbackMessage}
            items={model.menuItems}
            onSelectItem={model.openBody}
            onRetry={shell.retryHandler}
          />
        )}
        <SceneKeyboardControls
          ref={keyboardControlsRef}
          groupLabel={uiContent.celestialBodiesGroup}
          items={model.keyboardItems}
          onItemFocus={model.focusBody}
          onItemBlur={model.blurBody}
          onItemActivate={model.openBody}
        />
        {!isBodyOpen && (
          <TargetLock
            targets={model.lockTargets}
            activeId={model.trackedBodyId}
            channel={shell.frameChannel}
          />
        )}
        <QuickAccessMenu items={model.menuItems} onSelectItem={model.openBody} />
      </div>
      <ContentPanel
        isOpen={model.openPanel !== null}
        title={model.openPanel?.title ?? ''}
        panelLabel={model.openPanel?.panelLabel ?? ''}
        onClose={model.deselect}
        getFallbackFocus={model.focusLastOpenedBody}
        footer={<AttributionNote credits={credits} />}
      >
        {model.openPanel && <SectionView content={model.openPanel.content} />}
      </ContentPanel>
      {immersive.experience && (
        <ImmersiveView
          experience={immersive.experience}
          stage={immersive.stage}
          reducedMotion={skipsImmersiveTransition}
          onExit={model.deselect}
          getFallbackFocus={model.focusLastOpenedBody}
        />
      )}
    </>
  );
}
