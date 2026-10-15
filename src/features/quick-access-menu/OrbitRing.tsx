import type { CSSProperties } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type OrbitRingProps = {
  isOpen: boolean;
  isRingShown: boolean;
  radius: number;
};

const ringClasses =
  'transition-orbit-ring absolute rounded-full border border-dashed border-ember-400/33';
const glowClasses =
  'transition-orbit-glow absolute -top-32.5 -left-32.5 size-65 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-ember-400)_12%,transparent),transparent_65%)]';

export function OrbitRing({ isOpen, isRingShown, radius }: OrbitRingProps) {
  const diameter = radius * 2;
  const ringStyle: CSSProperties = {
    width: diameter,
    height: diameter,
    top: -radius,
    left: -radius,
  };
  const ringState = isRingShown ? 'scale-100 opacity-100' : 'scale-20 opacity-0';
  const glowState = isOpen ? 'opacity-100' : 'opacity-0';

  return (
    <>
      <div aria-hidden="true" className={joinClassNames(glowClasses, glowState)} />
      <div
        aria-hidden="true"
        className={joinClassNames(ringClasses, ringState)}
        style={ringStyle}
      />
    </>
  );
}
