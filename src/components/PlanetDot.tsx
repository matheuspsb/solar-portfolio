import type { PlanetSize, PlanetTone } from '@/domain/celestial-body';
import { joinClassNames } from '@/lib/join-class-names';

type PlanetDotSize = PlanetSize | 'orbit';

type PlanetDotProps = {
  tone: PlanetTone;
  size: PlanetDotSize;
};

const toneClasses: Record<PlanetTone, string> = {
  cyan: 'text-planet-cyan',
  white: 'text-planet-white',
  blue: 'text-planet-blue',
  green: 'text-planet-green',
  orchid: 'text-planet-orchid',
  amber: 'text-planet-amber',
  periwinkle: 'text-planet-periwinkle',
};

const sizeClasses: Record<PlanetDotSize, string> = {
  xs: 'size-1.75',
  sm: 'size-2',
  md: 'size-2.25',
  lg: 'size-2.5',
  xl: 'size-2.75',
  orbit: 'size-4.5 shadow-planet-strong',
};

export function PlanetDot({ tone, size }: PlanetDotProps) {
  return (
    <span
      aria-hidden="true"
      className={joinClassNames(
        'inline-block shrink-0 rounded-full bg-current shadow-planet',
        toneClasses[tone],
        sizeClasses[size],
      )}
    />
  );
}
