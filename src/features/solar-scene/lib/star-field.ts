import { FULL_TURN_RADIANS } from './rotation';

type RandomSource = () => number;

const MULBERRY_INCREMENT = 0x6d2b79f5;
const UINT32_RANGE = 4294967296;

/** mulberry32: tiny deterministic PRNG so the sky is identical on every render. */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

type StarPositionsInput = {
  count: number;
  radius: number;
  random: RandomSource;
};

/** Uniformly distributed points on a sphere, as a flat [x, y, z, ...] buffer. */
export function generateStarPositions({ count, radius, random }: StarPositionsInput): Float32Array {
  const isCountValid = Number.isFinite(count) && count > 0;
  const isRadiusValid = Number.isFinite(radius) && radius > 0;
  if (!isCountValid || !isRadiusValid) return new Float32Array(0);

  const starCount = Math.floor(count);
  const positions = new Float32Array(starCount * 3);
  for (let starIndex = 0; starIndex < starCount; starIndex += 1) {
    const height = random() * 2 - 1;
    const azimuth = random() * FULL_TURN_RADIANS;
    const ringRadius = Math.sqrt(1 - height * height);
    positions[starIndex * 3] = Math.cos(azimuth) * ringRadius * radius;
    positions[starIndex * 3 + 1] = height * radius;
    positions[starIndex * 3 + 2] = Math.sin(azimuth) * ringRadius * radius;
  }
  return positions;
}
