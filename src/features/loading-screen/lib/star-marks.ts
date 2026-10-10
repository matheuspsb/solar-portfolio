import { loaderTokens } from '@/styles/loader-tokens';
import { draw, enter, seg } from './easing';
import { createSeededRandom } from './seeded-random';
import { DESIGN_CUES } from './timeline';

export const STAGE_WIDTH = 1920;
export const STAGE_HEIGHT = 1080;
export const STAGE_CENTER_X = 960;
export const STAGE_CENTER_Y = 500;

export type StarMark = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  size: number;
  opacity: number;
  isStreak: boolean;
  color: string;
};

type Star = {
  x: number;
  y: number;
  depth: number;
  birthShare: number;
  twinklePhase: number;
};

const STAR_COUNT = 340;
const STAR_SEED = 7;
const VERTICAL_SPREAD = 0.62;
const FULL_TURN = Math.PI * 2;
const PROJECTION_SCALE = 520;
const MIN_DEPTH = 0.06;
const DEPTH_RANGE = 0.94;
const BIRTH_DELAY_SECONDS = 0.35;
const BIRTH_SPREAD_SECONDS = 1.7;
const BIRTH_FADE_SECONDS = 0.5;
const CRUISE_SPEED = 0.012;
const JUMP_DISTANCE = 2.6;
const JUMP_LEAD_SECONDS = 0.2;
const JUMP_TAIL_SECONDS = 0.7;
const SPEED_SAMPLE_SECONDS = 1 / 60;
const TAIL_PER_SPEED = 0.085;
const MAX_TAIL = 0.6;
const MIN_STREAK_TAIL = 0.004;
const STILL_SPEED = 0.05;
const TWINKLE_RATE = 2.2;
const TWINKLE_DEPTH = 0.28;
const MIN_SIZE = 0.6;
const SIZE_RANGE = 2.3;
const DOT_RADIUS_DIVISOR = 1.5;
const MIN_BRIGHTNESS = 0.3;
const BRIGHTNESS_RANGE = 0.7;
const COOL_STAR_EVERY = 5;
const CULL_MARGIN = 40;
const NEBULA_DIM_SECONDS = 1.2;
const NEBULA_DIM_SHARE = 0.5;
const IGNITION_DIM_START_SECONDS = 0.3;
const IGNITION_DIM_END_SECONDS = 0.5;
const IGNITION_DIM_SHARE = 0.4;
const FINALE_FADE_SECONDS = 0.5;

function createStars(): readonly Star[] {
  const random = createSeededRandom(STAR_SEED);
  return Array.from({ length: STAR_COUNT }, () => ({
    x: random() * 2 - 1,
    y: (random() * 2 - 1) * VERTICAL_SPREAD,
    depth: random(),
    birthShare: random(),
    twinklePhase: random() * FULL_TURN,
  }));
}

const STARS = createStars();

function fractionOf(value: number): number {
  return value - Math.floor(value);
}

function getTravelledDistance(designSeconds: number): number {
  const { hyperspace, nebula } = DESIGN_CUES;
  return (
    CRUISE_SPEED * designSeconds +
    JUMP_DISTANCE *
      draw(seg(designSeconds, hyperspace - JUMP_LEAD_SECONDS, nebula + JUMP_TAIL_SECONDS))
  );
}

function getLayerOpacity(designSeconds: number): number {
  const { nebula, ignition, finale } = DESIGN_CUES;
  const nebulaDim = 1 - NEBULA_DIM_SHARE * seg(designSeconds, nebula, nebula + NEBULA_DIM_SECONDS);
  const ignitionDim =
    1 -
    seg(designSeconds, ignition + IGNITION_DIM_START_SECONDS, ignition + IGNITION_DIM_END_SECONDS) *
      IGNITION_DIM_SHARE;
  const finaleFade = 1 - seg(designSeconds, finale, finale + FINALE_FADE_SECONDS);
  return nebulaDim * ignitionDim * finaleFade;
}

function project(spreadX: number, spreadY: number, depth: number): [number, number] {
  return [
    STAGE_CENTER_X + (spreadX / depth) * PROJECTION_SCALE,
    STAGE_CENTER_Y + (spreadY / depth) * PROJECTION_SCALE,
  ];
}

function isInsideStage(pointX: number, pointY: number): boolean {
  return (
    pointX >= -CULL_MARGIN &&
    pointX <= STAGE_WIDTH + CULL_MARGIN &&
    pointY >= -CULL_MARGIN &&
    pointY <= STAGE_HEIGHT + CULL_MARGIN
  );
}

export function getStarMarks(designSeconds: number, ambientSeconds: number): StarMark[] {
  const layerOpacity = getLayerOpacity(designSeconds);
  if (layerOpacity <= 0) return [];

  const speed =
    (getTravelledDistance(designSeconds) -
      getTravelledDistance(designSeconds - SPEED_SAMPLE_SECONDS)) /
    SPEED_SAMPLE_SECONDS;
  const tail = Math.min(speed * TAIL_PER_SPEED, MAX_TAIL);
  const travelled = getTravelledDistance(designSeconds);
  const marks: StarMark[] = [];

  STARS.forEach((star, index) => {
    const birth = DESIGN_CUES.start + BIRTH_DELAY_SECONDS + star.birthShare * BIRTH_SPREAD_SECONDS;
    const appearance = enter(seg(designSeconds, birth, birth + BIRTH_FADE_SECONDS));
    if (appearance <= 0) return;

    const depth = MIN_DEPTH + DEPTH_RANGE * fractionOf(star.depth - travelled);
    const [toX, toY] = project(star.x, star.y, depth);
    if (!isInsideStage(toX, toY)) return;

    const size = MIN_SIZE + (1 - depth) * SIZE_RANGE;
    const twinkle =
      speed < STILL_SPEED
        ? 1 -
          TWINKLE_DEPTH +
          TWINKLE_DEPTH * Math.sin(ambientSeconds * TWINKLE_RATE + star.twinklePhase)
        : 1;
    const opacity =
      appearance * (MIN_BRIGHTNESS + BRIGHTNESS_RANGE * (1 - depth)) * twinkle * layerOpacity;
    const isStreak = tail >= MIN_STREAK_TAIL;
    const [fromX, fromY] = isStreak
      ? project(star.x, star.y, Math.min(1, depth + tail))
      : [toX, toY];
    const color = index % COOL_STAR_EVERY ? loaderTokens.starColor : loaderTokens.coolStarColor;

    marks.push({
      fromX,
      fromY,
      toX,
      toY,
      size: isStreak ? size : size / DOT_RADIUS_DIVISOR,
      opacity,
      isStreak,
      color,
    });
  });

  return marks;
}
