import { Suspense, lazy } from 'react';
import type { ReactNode } from 'react';
import type { ImmersiveExperience } from '@/domain/celestial-body';

const ArcadeExperience = lazy(() =>
  import('@/features/venus-arcade').then((module) => ({ default: module.ArcadeExperience })),
);

type ImmersiveViewProps = {
  experience: ImmersiveExperience;
  onExit: () => void;
  getFallbackFocus: () => HTMLElement | null;
  menu: ReactNode;
};

export function ImmersiveView({ experience, ...shellProps }: ImmersiveViewProps) {
  switch (experience) {
    case 'venus-arcade':
      return (
        <Suspense fallback={null}>
          <ArcadeExperience {...shellProps} />
        </Suspense>
      );
  }
}
