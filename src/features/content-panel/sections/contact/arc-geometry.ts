export const ARC_WIDTH = 450;
export const ARC_HEIGHT = 150;
export const DELIVERY_HEIGHT = 340;

export const STEP_PROGRESS = [0.17, 0.5, 0.83] as const;
export const COMET_ENTRY_PROGRESS = -0.12;
export const COMET_EXIT_PROGRESS = 1.1;

const ARC_START = { x: -10, y: 128 };
const ARC_CONTROL = { x: 225, y: -10 };
const ARC_END = { x: 460, y: 128 };

const PROGRESS_SAMPLES = 40;
const TRAIL_SEGMENTS = 18;
const TRAIL_BRIGHT_SEGMENTS = 3;
const TRAIL_MIN_DISTANCE = 0.002;
const TRAIL_MAX_WIDTH = 4.2;
const TRAIL_MIN_WIDTH = 0.4;
const TRAIL_MAX_OPACITY = 0.9;
const ARRIVAL_TOLERANCE = 0.003;

export type Point = { x: number; y: number };
export type PlanetState = 'future' | 'current' | 'done';

export type TrailSegment = {
  from: Point;
  to: Point;
  width: number;
  opacity: number;
  isBright: boolean;
};

export function getArcPoint(progress: number): Point {
  const remaining = 1 - progress;
  const startWeight = remaining * remaining;
  const controlWeight = 2 * remaining * progress;
  const endWeight = progress * progress;
  return {
    x: startWeight * ARC_START.x + controlWeight * ARC_CONTROL.x + endWeight * ARC_END.x,
    y: startWeight * ARC_START.y + controlWeight * ARC_CONTROL.y + endWeight * ARC_END.y,
  };
}

export function buildProgressPath(progress: number): string {
  if (!(progress > 0)) return '';
  const clamped = Math.min(1, progress);
  const commands: string[] = [];
  for (let sample = 0; sample <= PROGRESS_SAMPLES; sample += 1) {
    const point = getArcPoint((clamped * sample) / PROGRESS_SAMPLES);
    const command = sample === 0 ? 'M' : 'L';
    commands.push(`${command} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  }
  return commands.join(' ');
}

export function getCometTrail({ head, tail }: { head: number; tail: number }): TrailSegment[] {
  const distance = head - tail;
  if (!Number.isFinite(distance) || Math.abs(distance) <= TRAIL_MIN_DISTANCE) return [];

  return Array.from({ length: TRAIL_SEGMENTS }, (_value, index) => {
    const fade = 1 - index / TRAIL_SEGMENTS;
    return {
      from: getArcPoint(head - (distance * index) / TRAIL_SEGMENTS),
      to: getArcPoint(head - (distance * (index + 1)) / TRAIL_SEGMENTS),
      width: TRAIL_MAX_WIDTH * fade + TRAIL_MIN_WIDTH,
      opacity: fade * TRAIL_MAX_OPACITY,
      isBright: index < TRAIL_BRIGHT_SEGMENTS,
    };
  });
}

type PlanetStateInput = {
  index: number;
  currentStep: number;
  isDelivered: boolean;
  progress: number;
};

export function getPlanetState({
  index,
  currentStep,
  isDelivered,
  progress,
}: PlanetStateInput): PlanetState {
  const planetProgress = STEP_PROGRESS[index];
  const hasArrived = planetProgress !== undefined && progress >= planetProgress - ARRIVAL_TOLERANCE;
  if (!hasArrived) return 'future';
  if (index < currentStep || isDelivered) return 'done';
  return index === currentStep ? 'current' : 'future';
}
