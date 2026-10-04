import { joinClassNames } from '@/lib/join-class-names';

type PlanetToggleIconProps = {
  isOpen: boolean;
};

/**
 * A small ringed planet; the ring flips when the menu opens. Decorative.
 * The ring uses `rounded-ellipse` (50%): `rounded-full` on a wide, short box draws a stadium, not an ellipse.
 */
export function PlanetToggleIcon({ isOpen }: PlanetToggleIconProps) {
  const ringTilt = isOpen ? 'rotate-160' : '-rotate-20';

  return (
    <span aria-hidden="true" className="relative -mr-px flex size-11 items-center justify-center">
      <span className="size-4 rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--color-ember-300),var(--color-ember-400)_50%,var(--color-ember-700))] text-ember-400 shadow-planet-toggle" />
      <span
        className={joinClassNames(
          'transition-orbit-tilt absolute h-2.25 w-7.5 rounded-ellipse border-[1.5px] border-ember-400/67',
          ringTilt,
        )}
      />
    </span>
  );
}
