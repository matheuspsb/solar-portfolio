import { Suspense, lazy } from 'react';
import type { ImmersiveExperience } from '@/domain/celestial-body';
import type { ImmersiveStage } from './use-immersive-stage';

const ArcadeExperience = lazy(() =>
  import('@/features/venus-arcade').then((module) => ({ default: module.ArcadeExperience })),
);
const DiveEffects = lazy(() =>
  import('@/features/venus-arcade').then((module) => ({ default: module.DiveEffects })),
);

type ImmersiveViewProps = {
  experience: ImmersiveExperience;
  stage: ImmersiveStage;
  reducedMotion: boolean;
  onExit: () => void;
  getFallbackFocus: () => HTMLElement | null;
};

export function ImmersiveView({
  experience,
  stage,
  reducedMotion,
  onExit,
  getFallbackFocus,
}: ImmersiveViewProps) {
  switch (experience) {
    case 'venus-arcade': {
      const isMounted = stage === 'open' || stage === 'surfacing';
      return (
        <Suspense fallback={null}>
          <DiveEffects phase={stage} reducedMotion={reducedMotion} />
          {isMounted && (
            <ArcadeExperience
              isLeaving={stage === 'surfacing'}
              onExit={onExit}
              getFallbackFocus={getFallbackFocus}
            />
          )}
        </Suspense>
      );
    }
  }
}
