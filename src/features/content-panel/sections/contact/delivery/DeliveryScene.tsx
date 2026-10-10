import type { CSSProperties } from 'react';
import type { ContactContent } from '@/domain/contact-content';
import { DELIVERY_HEIGHT } from '../journey/arc-geometry';
import {
  DELIVERY_ROUTE,
  DELIVERY_SCENE_WIDTH,
  LAUNCH_POINT,
  MERCURY_CENTER,
  MERCURY_ORBIT_RADIUS,
  getStarPositions,
} from './delivery-geometry';
import { DeliveryStamp } from './DeliveryStamp';
import { FlyingEnvelope } from './FlyingEnvelope';
import { MercuryPlanet } from './MercuryPlanet';

const STAR_COUNT = 34;
const STARS = getStarPositions(STAR_COUNT);
const PAD_WIDTH = 44;
const PAD_HEIGHT = 14;
const ORIGIN_LABEL_POSITION = { left: 50, top: 304 };

type TwinkleStyle = CSSProperties & { '--animation-delay': string; '--twinkle-duration': string };

type DeliverySceneProps = {
  delivered: ContactContent['delivered'];
  dateLabel: string;
  reducedMotion: boolean;
};

export function DeliveryScene({ delivered, dateLabel, reducedMotion }: DeliverySceneProps) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,color-mix(in_srgb,var(--color-nebula-300)_8%,transparent),transparent_50%)]"
    >
      {STARS.map((star) => {
        const style: TwinkleStyle = {
          left: star.x,
          top: star.y,
          '--animation-delay': `${star.delaySeconds}s`,
          '--twinkle-duration': `${star.durationSeconds}s`,
        };
        return (
          <span
            key={`${star.x}-${star.y}`}
            className={`absolute rounded-ellipse bg-white opacity-40 motion-safe:animate-twinkle ${
              star.isLarge ? 'size-[2.5px]' : 'size-[1.5px]'
            }`}
            style={style}
          />
        );
      })}

      <svg
        width={DELIVERY_SCENE_WIDTH}
        height={DELIVERY_HEIGHT}
        viewBox={`0 0 ${DELIVERY_SCENE_WIDTH} ${DELIVERY_HEIGHT}`}
        className="absolute top-0 left-0"
      >
        <path
          d={DELIVERY_ROUTE}
          strokeWidth={1}
          strokeDasharray="3 6"
          className="fill-none stroke-white/15"
        />
        <path
          d={DELIVERY_ROUTE}
          strokeWidth={1.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100 100"
          strokeDashoffset={0}
          className="fill-none stroke-ember-400 motion-safe:animate-draw-route"
        />
        <circle
          cx={MERCURY_CENTER.x}
          cy={MERCURY_CENTER.y}
          r={MERCURY_ORBIT_RADIUS}
          strokeWidth={1}
          strokeDasharray="2 5"
          className="fill-none stroke-white/12"
        />
      </svg>

      <div
        className="absolute rounded-ellipse border border-ember-400/53 bg-[radial-gradient(color-mix(in_srgb,var(--color-ember-400)_27%,transparent),transparent_70%)] motion-safe:animate-launch-pad"
        style={{
          left: LAUNCH_POINT.x - PAD_WIDTH / 2,
          top: LAUNCH_POINT.y - PAD_HEIGHT / 2,
          width: PAD_WIDTH,
          height: PAD_HEIGHT,
        }}
      />
      <span
        className="absolute font-mono text-label tracking-label text-ink-400"
        style={ORIGIN_LABEL_POSITION}
      >
        {delivered.originLabel}
      </span>

      <MercuryPlanet label={delivered.destinationLabel} reducedMotion={reducedMotion} />
      {!reducedMotion && <FlyingEnvelope />}
      <DeliveryStamp stamp={delivered.stamp} dateLabel={dateLabel} />
    </div>
  );
}
