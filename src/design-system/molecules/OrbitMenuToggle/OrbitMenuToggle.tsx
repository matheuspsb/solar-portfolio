import type { ComponentProps } from 'react';
import { PlanetToggleIcon } from './PlanetToggleIcon';

type OrbitMenuToggleProps = Omit<ComponentProps<'button'>, 'children' | 'aria-expanded'> & {
  label: string;
  isOpen: boolean;
  /** Id of the list this button shows and hides. */
  controlsId: string;
};

export function OrbitMenuToggle({
  label,
  isOpen,
  controlsId,
  type = 'button',
  ...rest
}: OrbitMenuToggleProps) {
  return (
    <button
      type={type}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      className="relative z-10 inline-flex h-11 cursor-pointer items-center gap-3 rounded-pill border border-line-control bg-panel-start/90 pl-4.5 text-body font-medium text-ink-100 backdrop-blur-sm transition-colors duration-base hover:border-ember-400 aria-expanded:border-ember-400"
      {...rest}
    >
      {label}
      <PlanetToggleIcon isOpen={isOpen} />
    </button>
  );
}
