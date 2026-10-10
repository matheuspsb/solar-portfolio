import { loaderTokens } from '@/styles/loader-tokens';
import { enter, mix, seg } from './easing';
import { createSeededRandom } from './seeded-random';
import { DESIGN_CUES } from './timeline';

export const DISC_TILT_DEGREES = -9;

export type DustMark = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  color: string;
  opacity: number;
};

type Dust = {
  startRadius: number;
  startAngle: number;
  speed: number;
  width: number;
  isCool: boolean;
  appearShare: number;
};

const DUST_COUNT = 220;
const DUST_SEED = 42;
const FULL_TURN = Math.PI * 2;
const MIN_START_RADIUS = 260;
const START_RADIUS_RANGE = 840;
const MIN_SPEED = 0.7;
const SPEED_RANGE = 0.6;
const MIN_WIDTH = 0.8;
const WIDTH_RANGE = 2;
const COOL_SHARE = 0.28;
const CORE_RADIUS = 22;
const DISC_FLATTENING = 0.34;
const COLLAPSE_LEAD_SECONDS = 0.4;
const COLLAPSE_TAIL_SECONDS = 0.25;
const COLLAPSE_CURVE = 1.6;
const SPIN_RATE = 0.8;
const INNER_SPIN_GAIN = 8;
const SPIN_REFERENCE_RADIUS = 500;
const HOT_RADIUS = 220;
const BLUR_SECONDS = 0.08;
const APPEAR_LEAD_SECONDS = 0.6;
const APPEAR_SPREAD_SECONDS = 1.3;
const APPEAR_FADE_SECONDS = 0.7;
const VISIBLE_LEAD_SECONDS = 1;
const FADE_START_SECONDS = 0.2;
const FADE_END_SECONDS = 0.36;
const MIN_COLLAPSE_BRIGHTNESS = 0.45;
const COLLAPSE_BRIGHTNESS_GAIN = 0.55;
const NEBULA_FADE_IN_LEAD_SECONDS = 0.3;
const NEBULA_FADE_IN_TAIL_SECONDS = 1;
const NEBULA_FADE_OUT_START_SECONDS = 0.2;
const NEBULA_FADE_OUT_END_SECONDS = 0.8;
const NEBULA_START_SCALE = 1.15;
const NEBULA_SCALE_SHRINK = 0.15;
const WARM_ROTATION_RATE = 2;
const COOL_START_DEGREES = 20;
const COOL_ROTATION_RATE = 3;

function createDust(): readonly Dust[] {
  const random = createSeededRandom(DUST_SEED);
  return Array.from({ length: DUST_COUNT }, () => ({
    startRadius: MIN_START_RADIUS + random() * START_RADIUS_RANGE,
    startAngle: random() * FULL_TURN,
    speed: MIN_SPEED + random() * SPEED_RANGE,
    width: MIN_WIDTH + random() * WIDTH_RANGE,
    isCool: random() < COOL_SHARE,
    appearShare: random(),
  }));
}

const DUST = createDust();

function getPosition(dust: Dust, designSeconds: number): { x: number; y: number; radius: number } {
  const { nebula, ignition } = DESIGN_CUES;
  const collapse = Math.pow(
    seg(designSeconds, nebula - COLLAPSE_LEAD_SECONDS, ignition + COLLAPSE_TAIL_SECONDS),
    COLLAPSE_CURVE,
  );
  const radius = mix(dust.startRadius, CORE_RADIUS, collapse);
  const angle =
    dust.startAngle +
    (designSeconds - nebula) * SPIN_RATE * dust.speed +
    collapse *
      collapse *
      INNER_SPIN_GAIN *
      dust.speed *
      Math.sqrt(SPIN_REFERENCE_RADIUS / dust.startRadius);
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * DISC_FLATTENING, radius };
}

function pickColor(dust: Dust, radius: number): string {
  if (dust.isCool) return loaderTokens.dustCoolColor;
  return radius < HOT_RADIUS ? loaderTokens.dustHotColor : loaderTokens.dustWarmColor;
}

export function getDustMarks(designSeconds: number): DustMark[] {
  const { nebula, ignition } = DESIGN_CUES;
  if (designSeconds <= nebula - VISIBLE_LEAD_SECONDS) return [];

  const fadeOut =
    1 - seg(designSeconds, ignition + FADE_START_SECONDS, ignition + FADE_END_SECONDS);
  if (fadeOut <= 0) return [];

  const collapseProgress = Math.pow(
    seg(designSeconds, nebula - COLLAPSE_LEAD_SECONDS, ignition + COLLAPSE_TAIL_SECONDS),
    COLLAPSE_CURVE,
  );
  const marks: DustMark[] = [];

  for (const dust of DUST) {
    const appear = nebula - APPEAR_LEAD_SECONDS + dust.appearShare * APPEAR_SPREAD_SECONDS;
    const appearance = enter(seg(designSeconds, appear, appear + APPEAR_FADE_SECONDS)) * fadeOut;
    if (appearance <= 0) continue;

    const current = getPosition(dust, designSeconds);
    const previous = getPosition(dust, designSeconds - BLUR_SECONDS);
    marks.push({
      fromX: previous.x,
      fromY: previous.y,
      toX: current.x,
      toY: current.y,
      width: dust.width,
      color: pickColor(dust, current.radius),
      opacity: appearance * (MIN_COLLAPSE_BRIGHTNESS + COLLAPSE_BRIGHTNESS_GAIN * collapseProgress),
    });
  }

  return marks;
}

export function getNebula(designSeconds: number): {
  opacity: number;
  warmRotationDegrees: number;
  warmScale: number;
  coolRotationDegrees: number;
} {
  const { nebula, ignition } = DESIGN_CUES;
  const opacity =
    enter(
      seg(
        designSeconds,
        nebula - NEBULA_FADE_IN_LEAD_SECONDS,
        nebula + NEBULA_FADE_IN_TAIL_SECONDS,
      ),
    ) *
    (1 -
      seg(
        designSeconds,
        ignition + NEBULA_FADE_OUT_START_SECONDS,
        ignition + NEBULA_FADE_OUT_END_SECONDS,
      ));
  const collapse = seg(
    designSeconds,
    nebula - COLLAPSE_LEAD_SECONDS,
    ignition + COLLAPSE_TAIL_SECONDS,
  );
  return {
    opacity,
    warmRotationDegrees: DISC_TILT_DEGREES + designSeconds * WARM_ROTATION_RATE,
    warmScale: NEBULA_START_SCALE - NEBULA_SCALE_SHRINK * collapse,
    coolRotationDegrees: COOL_START_DEGREES - designSeconds * COOL_ROTATION_RATE,
  };
}
