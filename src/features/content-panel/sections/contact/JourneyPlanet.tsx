import { joinClassNames } from '@/lib/join-class-names';
import type { PlanetState, Point } from './arc-geometry';

const LABEL_OFFSET_PIXELS = 18;

type JourneyPlanetProps = {
  position: Point;
  state: PlanetState;
  label: string;
  jumpLabel: string;
  isJumpable: boolean;
  reducedMotion: boolean;
  onJump: () => void;
};

const dotClasses = {
  future: 'size-2.5 border-line-planet bg-panel-start',
  current: 'size-5 border-ember-400 bg-panel-start',
  done: 'size-3 border-ember-400 bg-ember-400 shadow-ember-planet',
} as const;

const labelClasses = {
  future: 'text-ink-400',
  current: 'text-ink-100',
  done: 'text-ember-400',
} as const;

export function JourneyPlanet({
  position,
  state,
  label,
  jumpLabel,
  isJumpable,
  reducedMotion,
  onJump,
}: JourneyPlanetProps) {
  const pulseClass = state === 'current' && !reducedMotion ? 'motion-safe:animate-dot-pulse' : '';
  const dot = (
    <span
      aria-hidden="true"
      className={joinClassNames(
        'absolute top-0 left-0 block -translate-x-1/2 -translate-y-1/2 rounded-ellipse border-[1.5px] transition-[width,height,background-color,border-color] duration-slow ease-orbit-item',
        dotClasses[state],
        pulseClass,
      )}
    />
  );

  return (
    <div className="absolute size-0" style={{ left: position.x, top: position.y }}>
      {isJumpable ? (
        <button
          type="button"
          aria-label={jumpLabel}
          onClick={onJump}
          className="absolute top-0 left-0 size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-ellipse"
        >
          {dot}
        </button>
      ) : (
        dot
      )}
      <span
        aria-hidden="true"
        className={joinClassNames(
          'absolute left-0 -translate-x-1/2 font-mono text-label tracking-label whitespace-nowrap transition-colors duration-base',
          labelClasses[state],
        )}
        style={{ top: LABEL_OFFSET_PIXELS }}
      >
        {label}
      </span>
    </div>
  );
}
