const MULTIPLIER_STEP = 0x6d2b79f5;
const UINT32_RANGE = 4294967296;

export function createSeededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + MULTIPLIER_STEP) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}
