import { draw, enter, mix, pop, seg } from './easing';
import { STAGE_CENTER_X, STAGE_CENTER_Y } from './star-marks';
import { DESIGN_CUES } from './timeline';

export type CoreMark = { radius: number; flicker: number };

export type SunMark = {
  radius: number;
  haloOpacity: number;
  haloStrength: number;
  lightX: number;
  lightY: number;
};

export type RayMark = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  opacity: number;
};

export type WaveMark = {
  radius: number;
  strokeWidth: number;
  opacity: number;
  tone: 'white' | 'warm';
};

const CORE_SPARK_RADIUS = 3;
const CORE_SPARK_START_SECONDS = 0.15;
const CORE_SPARK_END_SECONDS = 0.7;
const CORE_SWELL_RADIUS = 3;
const CORE_COLLAPSE_RADIUS = 26;
const FLICKER_PEAK_SECONDS = 0.25;
const FLICKER_RATE = 6;
const FLICKER_GAIN = 0.6;
const IMPLODE_SECONDS = 0.3;
const IMPLODED_RADIUS = 8;
const SUN_BIRTH_DELAY_SECONDS = 0.3;
const SUN_POP_START_SECONDS = 0.34;
const SUN_POP_END_SECONDS = 1.1;
const SUN_BORN_RADIUS = 10;
const SUN_RADIUS = 140;
const SUN_EXPANDED_RADIUS = 1500;
const SUN_EXPANSION_SECONDS = 0.95;
const SUN_EXPANSION_CURVE = 3.2;
const HALO_NORMAL_STRENGTH = 0.333;
const HALO_EXPANDED_STRENGTH = 0.8;
const HALO_PULSE_RATE = 3;
const HALO_BASE_OPACITY = 0.85;
const HALO_PULSE_DEPTH = 0.15;
const LIGHT_BASE_X = 38;
const LIGHT_BASE_Y = 36;
const LIGHT_DRIFT = 3;
const LIGHT_DRIFT_RATE_X = 0.9;
const LIGHT_DRIFT_RATE_Y = 0.7;
const RAY_COUNT = 56;
const RAY_SPIN_RATE = 0.08;
const RAY_START_RATIO = 1.04;
const RAY_BASE_RATIO = 1.22;
const RAY_PULSE_RATIO = 0.18;
const RAY_PULSE_RATE = 2.6;
const RAY_PULSE_PHASE = 1.7;
const RAY_LONG_BONUS_RATIO = 0.12;
const RAY_LONG_EVERY = 3;
const RAY_OPACITY = 0.35;
const RAY_THIN_WIDTH = 1.2;
const RAY_THICK_WIDTH = 2;
const RAY_FADE_SECONDS = 0.3;
const FULL_TURN = Math.PI * 2;
const WAVE_START_SECONDS = 0.34;
const WAVE_END_SECONDS = 1.9;
const WAVE_START_RADIUS = 20;
const WAVE_TRAVEL = 1500;
const WAVE_OPACITY = 0.9;
const WAVE_WARM_DELAY_SECONDS = 0.14;
const WHITE_WAVE_WIDTH = 22;
const WARM_WAVE_WIDTH = 10;
const FLASH_START_SECONDS = 0.28;
const FLASH_PEAK_SECONDS = 0.38;
const FLASH_DECAY_SECONDS = 1.3;
const FLASH_OPACITY = 0.9;

export function getCoreMark(designSeconds: number): CoreMark | null {
  const { start, hyperspace, nebula, ignition } = DESIGN_CUES;
  if (designSeconds >= ignition + SUN_BIRTH_DELAY_SECONDS) return null;

  const grownRadius =
    CORE_SPARK_RADIUS *
      pop(seg(designSeconds, start + CORE_SPARK_START_SECONDS, start + CORE_SPARK_END_SECONDS)) +
    CORE_SWELL_RADIUS * seg(designSeconds, hyperspace, nebula) +
    CORE_COLLAPSE_RADIUS * draw(seg(designSeconds, nebula, ignition));
  const isImploding = designSeconds >= ignition;
  const radius = isImploding
    ? mix(
        grownRadius,
        IMPLODED_RADIUS,
        enter(seg(designSeconds, ignition, ignition + IMPLODE_SECONDS)),
      )
    : grownRadius;
  if (radius <= 0) return null;

  const flicker =
    1 +
    FLICKER_GAIN *
      Math.exp(-Math.pow((designSeconds - start - FLICKER_PEAK_SECONDS) * FLICKER_RATE, 2));
  return { radius, flicker };
}

function getSunRadius(designSeconds: number): number {
  const { ignition, finale } = DESIGN_CUES;
  if (designSeconds >= finale) {
    return mix(
      SUN_RADIUS,
      SUN_EXPANDED_RADIUS,
      Math.pow(seg(designSeconds, finale, finale + SUN_EXPANSION_SECONDS), SUN_EXPANSION_CURVE),
    );
  }
  if (designSeconds < ignition + SUN_BIRTH_DELAY_SECONDS) return 0;
  return mix(
    SUN_BORN_RADIUS,
    SUN_RADIUS,
    pop(seg(designSeconds, ignition + SUN_POP_START_SECONDS, ignition + SUN_POP_END_SECONDS)),
  );
}

export function getSunMark(designSeconds: number, ambientSeconds: number): SunMark | null {
  const radius = getSunRadius(designSeconds);
  if (radius <= 0) return null;

  return {
    radius,
    haloOpacity: HALO_BASE_OPACITY + HALO_PULSE_DEPTH * Math.sin(ambientSeconds * HALO_PULSE_RATE),
    haloStrength:
      designSeconds >= DESIGN_CUES.finale ? HALO_EXPANDED_STRENGTH : HALO_NORMAL_STRENGTH,
    lightX: LIGHT_BASE_X + LIGHT_DRIFT * Math.sin(ambientSeconds * LIGHT_DRIFT_RATE_X),
    lightY: LIGHT_BASE_Y + LIGHT_DRIFT * Math.cos(ambientSeconds * LIGHT_DRIFT_RATE_Y),
  };
}

export function getRayMarks(designSeconds: number, ambientSeconds: number): RayMark[] {
  const radius = getSunRadius(designSeconds);
  const { finale } = DESIGN_CUES;
  if (radius <= 0 || designSeconds >= finale + RAY_FADE_SECONDS) return [];

  const opacity = RAY_OPACITY * (1 - seg(designSeconds, finale, finale + RAY_FADE_SECONDS));
  return Array.from({ length: RAY_COUNT }, (_unused, index) => {
    const angle = (index / RAY_COUNT) * FULL_TURN + ambientSeconds * RAY_SPIN_RATE;
    const isLong = index % RAY_LONG_EVERY === 0;
    const length =
      radius *
      (RAY_BASE_RATIO +
        RAY_PULSE_RATIO * Math.sin(ambientSeconds * RAY_PULSE_RATE + index * RAY_PULSE_PHASE) +
        (isLong ? RAY_LONG_BONUS_RATIO : 0));
    return {
      fromX: STAGE_CENTER_X + Math.cos(angle) * radius * RAY_START_RATIO,
      fromY: STAGE_CENTER_Y + Math.sin(angle) * radius * RAY_START_RATIO,
      toX: STAGE_CENTER_X + Math.cos(angle) * length,
      toY: STAGE_CENTER_Y + Math.sin(angle) * length,
      width: isLong ? RAY_THICK_WIDTH : RAY_THIN_WIDTH,
      opacity,
    };
  });
}

function getWave(
  designSeconds: number,
  delaySeconds: number,
  tone: WaveMark['tone'],
  maxStrokeWidth: number,
): WaveMark | null {
  const { ignition } = DESIGN_CUES;
  const progress = seg(
    designSeconds,
    ignition + WAVE_START_SECONDS + delaySeconds,
    ignition + WAVE_END_SECONDS + delaySeconds,
  );
  if (progress <= 0 || progress >= 1) return null;

  const eased = enter(progress);
  return {
    radius: WAVE_START_RADIUS + WAVE_TRAVEL * eased,
    strokeWidth: maxStrokeWidth * (1 - eased) + 1,
    opacity: (1 - progress) * WAVE_OPACITY,
    tone,
  };
}

export function getWaveMarks(designSeconds: number): WaveMark[] {
  return [
    getWave(designSeconds, 0, 'white', WHITE_WAVE_WIDTH),
    getWave(designSeconds, WAVE_WARM_DELAY_SECONDS, 'warm', WARM_WAVE_WIDTH),
  ].filter((wave): wave is WaveMark => wave !== null);
}

export function getFlashOpacity(designSeconds: number): number {
  const { ignition } = DESIGN_CUES;
  const flash =
    designSeconds < ignition + FLASH_PEAK_SECONDS
      ? seg(designSeconds, ignition + FLASH_START_SECONDS, ignition + FLASH_PEAK_SECONDS)
      : 1 -
        enter(seg(designSeconds, ignition + FLASH_PEAK_SECONDS, ignition + FLASH_DECAY_SECONDS));
  return flash * FLASH_OPACITY;
}
