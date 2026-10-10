import type { CSSProperties } from 'react';
import { DELIVERY_ROUTE } from './delivery-geometry';

const PARTICLE_COUNT = 6;
const PARTICLE_BASE_SIZE = 6;
const PARTICLE_SHRINK_PER_STEP = 0.7;
const PARTICLE_DELAY_STEP_SECONDS = 0.045;
const BRIGHT_PARTICLES = 2;
const OFFSET_PATH = `path('${DELIVERY_ROUTE}')`;

type DelayStyle = CSSProperties & { '--animation-delay': string };

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_value, index) => {
  const step = index + 1;
  const size = PARTICLE_BASE_SIZE - step * PARTICLE_SHRINK_PER_STEP;
  const style: DelayStyle = {
    width: size,
    height: size,
    offsetPath: OFFSET_PATH,
    '--animation-delay': `${step * PARTICLE_DELAY_STEP_SECONDS}s`,
  };
  return { step, style, isBright: step <= BRIGHT_PARTICLES };
});

type WingProps = { top: number; flapDelaySeconds: number; opacity: number };

function Wing({ top, flapDelaySeconds, opacity }: WingProps) {
  const flapStyle: DelayStyle = { opacity, '--animation-delay': `${flapDelaySeconds}s` };
  return (
    <span
      className="absolute -left-3.25 h-2.25 w-4.5 origin-bottom-right motion-safe:animate-wings-in"
      style={{ top }}
    >
      <span
        className="block size-full origin-bottom-right rounded-[100%_0_60%_40%] bg-linear-to-r from-white/0 to-white motion-safe:animate-wing-flap"
        style={flapStyle}
      />
    </span>
  );
}

export function FlyingEnvelope() {
  return (
    <>
      {PARTICLES.map((particle) => (
        <span
          key={particle.step}
          className={`absolute top-0 left-0 rounded-ellipse opacity-0 shadow-spark motion-safe:animate-trail-particle ${
            particle.isBright ? 'bg-ember-300' : 'bg-ember-400'
          }`}
          style={particle.style}
        />
      ))}
      <div
        className="absolute top-0 left-0 z-10 h-5.75 w-8.5 motion-safe:animate-deliver"
        style={{ offsetPath: OFFSET_PATH, offsetRotate: 'auto' }}
      >
        <Wing top={-7} flapDelaySeconds={0} opacity={0.95} />
        <Wing top={-3} flapDelaySeconds={0.05} opacity={0.5} />
        <div className="absolute inset-0 overflow-hidden rounded-sm bg-paper-100 shadow-envelope">
          <span className="absolute top-0 left-0 h-[62%] w-full bg-paper-300 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          <span className="absolute top-2.25 left-3.25 size-2 rounded-ellipse bg-emblem-mid" />
        </div>
      </div>
    </>
  );
}
