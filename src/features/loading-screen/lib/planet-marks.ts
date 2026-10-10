import { loaderTokens } from '@/styles/loader-tokens';
import { draw, pop, seg } from './easing';
import { DESIGN_CUES } from './timeline';

export type RingMark = { radiusX: number; radiusY: number; drawProgress: number };

export type PlanetMark = {
  x: number;
  y: number;
  radius: number;
  scale: number;
  color: string;
  glowColor: string;
  trail: ReadonlyArray<readonly [number, number]>;
};

export type PlanetMarks = {
  rings: RingMark[];
  back: PlanetMark[];
  front: PlanetMark[];
};

type Planet = {
  radiusX: number;
  speed: number;
  startAngle: number;
  radius: number;
  color: string;
  glowColor: string;
};

const PLANETS: readonly Planet[] = [
  {
    radiusX: 300,
    speed: 0.9,
    startAngle: 0.6,
    radius: 10,
    color: loaderTokens.mercuryColor,
    glowColor: loaderTokens.planetHighlightColor,
  },
  {
    radiusX: 445,
    speed: 0.55,
    startAngle: 2.5,
    radius: 14,
    color: loaderTokens.blueColor,
    glowColor: loaderTokens.blueColor,
  },
  {
    radiusX: 600,
    speed: 0.36,
    startAngle: 4.2,
    radius: 11,
    color: loaderTokens.lilacColor,
    glowColor: loaderTokens.lilacColor,
  },
];

const ORBIT_FLATTENING = 0.3;
const RING_STAGGER_SECONDS = 0.22;
const RING_DRAW_SECONDS = 1.2;
const POP_DELAY_SECONDS = 0.85;
const POP_SECONDS = 0.5;
const TRAIL_ARC_RADIANS = 0.42;
const TRAIL_STEPS = 10;

function buildTrail(planet: Planet, angle: number): Array<readonly [number, number]> {
  const radiusY = planet.radiusX * ORBIT_FLATTENING;
  return Array.from({ length: TRAIL_STEPS + 1 }, (_unused, step) => {
    const trailAngle = angle - TRAIL_ARC_RADIANS * (step / TRAIL_STEPS);
    return [Math.cos(trailAngle) * planet.radiusX, Math.sin(trailAngle) * radiusY] as const;
  });
}

export function getPlanetMarks(designSeconds: number, ambientSeconds: number): PlanetMarks {
  const { orbits } = DESIGN_CUES;
  const marks: PlanetMarks = { rings: [], back: [], front: [] };

  PLANETS.forEach((planet, index) => {
    const radiusY = planet.radiusX * ORBIT_FLATTENING;
    const stagger = index * RING_STAGGER_SECONDS;
    const drawProgress = draw(
      seg(designSeconds, orbits + stagger, orbits + RING_DRAW_SECONDS + stagger),
    );
    if (drawProgress > 0) marks.rings.push({ radiusX: planet.radiusX, radiusY, drawProgress });

    const scale = pop(
      seg(
        designSeconds,
        orbits + POP_DELAY_SECONDS + stagger,
        orbits + POP_DELAY_SECONDS + POP_SECONDS + stagger,
      ),
    );
    if (scale <= 0) return;

    const angle = planet.startAngle + ambientSeconds * planet.speed;
    const mark: PlanetMark = {
      x: Math.cos(angle) * planet.radiusX,
      y: Math.sin(angle) * radiusY,
      radius: planet.radius,
      scale,
      color: planet.color,
      glowColor: planet.glowColor,
      trail: buildTrail(planet, angle),
    };
    (Math.sin(angle) < 0 ? marks.back : marks.front).push(mark);
  });

  return marks;
}
