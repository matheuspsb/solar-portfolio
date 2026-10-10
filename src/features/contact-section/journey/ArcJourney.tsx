import {
  ARC_HEIGHT,
  ARC_WIDTH,
  STEP_PROGRESS,
  buildProgressPath,
  getArcPoint,
  getCometTrail,
  getPlanetState,
} from './arc-geometry';
import type { CometStore } from './comet-store';
import { JourneyPlanet } from './JourneyPlanet';
import { useCometPosition } from './use-comet-position';
import { WarpLines } from './WarpLines';

const BASE_ARC_PATH = 'M -10 128 Q 225 -10 460 128';
const RIPPLE_RADIUS = 7;
const HALO_RADIUS = 12;
const CORE_RADIUS = 4.5;

type PlanetLabels = { label: string; jumpLabel: string };

type ArcJourneyProps = {
  planets: readonly PlanetLabels[];
  currentStep: number;
  isDelivered: boolean;
  isSending: boolean;
  reducedMotion: boolean;
  comet: CometStore;
  canJump: boolean;
  onJump: (index: number) => void;
};

export function ArcJourney({
  planets,
  currentStep,
  isDelivered,
  isSending,
  reducedMotion,
  comet,
  canJump,
  onJump,
}: ArcJourneyProps) {
  const { head, tail } = useCometPosition(comet);
  const headPoint = getArcPoint(head);
  const trail = getCometTrail({ head, tail });
  const progressPath = buildProgressPath(head);
  const states = planets.map((_planet, index) =>
    getPlanetState({ index, currentStep, isDelivered, progress: head }),
  );
  const showWarp = isSending && !reducedMotion;

  return (
    <div className="absolute top-0 left-0" style={{ width: ARC_WIDTH, height: ARC_HEIGHT }}>
      <svg
        aria-hidden="true"
        width={ARC_WIDTH}
        height={ARC_HEIGHT}
        viewBox={`0 0 ${ARC_WIDTH} ${ARC_HEIGHT}`}
        className="absolute top-0 left-0"
      >
        <path
          d={BASE_ARC_PATH}
          strokeWidth={1}
          strokeDasharray="4 5"
          className="fill-none stroke-white/18"
        />
        {progressPath && (
          <path d={progressPath} strokeWidth={1.5} className="fill-none stroke-ember-400/85" />
        )}
        {!reducedMotion &&
          states.map((state, index) => {
            if (state === 'future') return null;
            const point = getArcPoint(STEP_PROGRESS[index] ?? 0);
            return (
              <circle
                key={planets[index]?.label}
                cx={point.x}
                cy={point.y}
                r={RIPPLE_RADIUS}
                strokeWidth={1.5}
                className="origin-center fill-none stroke-ember-400 transform-fill motion-safe:animate-ripple"
              />
            );
          })}
      </svg>

      {planets.map((planet, index) => (
        <JourneyPlanet
          key={planet.label}
          position={getArcPoint(STEP_PROGRESS[index] ?? 0)}
          state={states[index] ?? 'future'}
          label={planet.label}
          jumpLabel={planet.jumpLabel}
          isJumpable={canJump && states[index] === 'done'}
          reducedMotion={reducedMotion}
          onJump={() => onJump(index)}
        />
      ))}

      <svg
        aria-hidden="true"
        width={ARC_WIDTH}
        height={ARC_HEIGHT}
        viewBox={`0 0 ${ARC_WIDTH} ${ARC_HEIGHT}`}
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
      >
        {trail.map((segment) => (
          <line
            key={`${segment.from.x}-${segment.from.y}`}
            x1={segment.from.x}
            y1={segment.from.y}
            x2={segment.to.x}
            y2={segment.to.y}
            strokeWidth={segment.width}
            strokeOpacity={segment.opacity}
            strokeLinecap="round"
            className={segment.isBright ? 'stroke-ember-300' : 'stroke-ember-400'}
          />
        ))}
        <circle cx={headPoint.x} cy={headPoint.y} r={HALO_RADIUS} className="fill-ember-400/16" />
        <circle
          cx={headPoint.x}
          cy={headPoint.y}
          r={CORE_RADIUS}
          className="fill-white drop-shadow-[0_0_5px_var(--color-ember-400)]"
        />
      </svg>

      {showWarp && <WarpLines />}
    </div>
  );
}
