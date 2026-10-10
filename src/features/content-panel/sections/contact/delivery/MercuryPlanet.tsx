import { MERCURY_CENTER, MERCURY_DIAMETER } from './delivery-geometry';

const LABEL_WIDTH = 100;
const LABEL_OFFSET_Y = 48;
const RADIUS = MERCURY_DIAMETER / 2;

const CRATERS = [
  { x: 18, y: 22, size: 10 },
  { x: 44, y: 16, size: 7 },
  { x: 36, y: 44, size: 13 },
  { x: 14, y: 48, size: 6 },
  { x: 52, y: 50, size: 5 },
] as const;

type MercuryPlanetProps = {
  label: string;
  reducedMotion: boolean;
};

export function MercuryPlanet({ label, reducedMotion }: MercuryPlanetProps) {
  const box = { left: MERCURY_CENTER.x - RADIUS, top: MERCURY_CENTER.y - RADIUS };

  return (
    <>
      <div
        className="absolute size-18 overflow-hidden rounded-ellipse bg-[radial-gradient(circle_at_34%_32%,var(--color-mercury-light),var(--color-mercury-mid)_45%,var(--color-mercury-shade)_80%,var(--color-mercury-dark))] shadow-mercury motion-safe:animate-mercury-glow"
        style={box}
      >
        {CRATERS.map((crater) => (
          <span
            key={`${crater.x}-${crater.y}`}
            className="absolute rounded-ellipse bg-[radial-gradient(circle_at_60%_60%,rgb(255_255_255/0.13),rgb(0_0_0/0.25)_70%)]"
            style={{ left: crater.x, top: crater.y, width: crater.size, height: crater.size }}
          />
        ))}
        <span className="absolute inset-0 rounded-ellipse bg-[radial-gradient(circle_at_75%_75%,transparent_40%,color-mix(in_srgb,var(--color-space-950)_60%,transparent)_85%)]" />
      </div>
      {!reducedMotion && (
        <div
          className="absolute size-18 rounded-ellipse border-2 border-ember-400 opacity-0 motion-safe:animate-flash"
          style={box}
        />
      )}
      <span
        className="absolute text-center font-mono text-label tracking-label text-ink-300"
        style={{
          left: MERCURY_CENTER.x - LABEL_WIDTH / 2,
          top: MERCURY_CENTER.y + LABEL_OFFSET_Y,
          width: LABEL_WIDTH,
        }}
      >
        {label}
      </span>
    </>
  );
}
