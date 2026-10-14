import { Suspense, lazy } from 'react';
import type { ImmersiveExperience } from '@/domain/celestial-body';

const ArcadeExperience = lazy(() =>
  import('@/features/venus-arcade').then((module) => ({ default: module.ArcadeExperience })),
);

type ImmersiveViewProps = {
  experience: ImmersiveExperience;
  onExit: () => void;
  getFallbackFocus: () => HTMLElement | null;
};

export function ImmersiveView({ experience, onExit, getFallbackFocus }: ImmersiveViewProps) {
  switch (experience) {
    case 'venus-arcade':
      return (
        <Suspense fallback={null}>
          <ArcadeExperience onExit={onExit} getFallbackFocus={getFallbackFocus} />
        </Suspense>
      );
  }
}
