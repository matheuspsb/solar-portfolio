import type { PlanetSize, PlanetTone } from '@/lib/celestial-body';
import { joinClassNames } from '@/lib/join-class-names';

/** `orbit` is the larger, brighter planet used by the quick-access menu. */
type PlanetDotSize = PlanetSize | 'orbit';

type PlanetDotProps = {
  tone: PlanetTone;
  size: PlanetDotSize;
};

// Full class names (not built from strings) so Tailwind can see them. Sizes are 7-11px on the spacing scale.
const toneClasses: Record<PlanetTone, string> = {
  cyan: 'text-planet-cyan',
  white: 'text-planet-white',
  blue: 'text-planet-blue',
  green: 'text-planet-green',
  orchid: 'text-planet-orchid',
  amber: 'text-planet-amber',
};

const sizeClasses: Record<PlanetDotSize, string> = {
  xs: 'size-1.75',
  sm: 'size-2',
  md: 'size-2.25',
  lg: 'size-2.5',
  xl: 'size-2.75',
  orbit: 'size-4.5 shadow-planet-strong',
};

/** A small glowing planet; decorative, so it is hidden from assistive technology. */
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
