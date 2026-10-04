import type { ComponentProps } from 'react';
import type { PlanetTone } from '@/lib/celestial-body';
import { Label } from '@/design-system/atoms/Label';
import { PlanetDot } from '@/design-system/atoms/PlanetDot';

type OrbitMenuItemProps = Omit<ComponentProps<'button'>, 'children' | 'type'> & {
  label: string;
  code: string;
  tone: PlanetTone;
};

export function OrbitMenuItem({ label, code, tone, ...rest }: OrbitMenuItemProps) {
  return (
    <button
      type="button"
      className="group absolute flex -translate-x-[calc(100%-9px)] -translate-y-1/2 cursor-pointer items-center gap-2.5 text-ink-100"
      {...rest}
    >
      <span className="flex flex-col items-center gap-px rounded-block border border-line-chip bg-panel-start/93 px-3 py-1.75 whitespace-nowrap">
        <span className="text-body font-medium transition-colors duration-fast group-hover:text-ember-400">
          {label}
        </span>
        <Label size="code" aria-hidden="true">
          {code}
        </Label>
      </span>
      <PlanetDot tone={tone} size="orbit" />
    </button>
  );
}
