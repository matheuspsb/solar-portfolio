const DEFAULT_FIELD_OF_VIEW_DEGREES = 50;
const DEFAULT_SCREEN_FILL = 0.5;
const MIN_SCREEN_FILL = 0.1;
const MAX_SCREEN_FILL = 0.95;
const FALLBACK_DISTANCE = 10;
const HALF_TURN_DEGREES = 180;

type FramingInput = {
  radius: number;
  fieldOfViewDegrees: number;
  aspectRatio: number;
  screenFill: number;
};

function sanitizeAspectRatio(aspectRatio: number): number {
  return Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
}

function sanitizeFieldOfView(fieldOfViewDegrees: number): number {
  const isUsable = fieldOfViewDegrees > 0 && fieldOfViewDegrees < HALF_TURN_DEGREES;
  return isUsable ? fieldOfViewDegrees : DEFAULT_FIELD_OF_VIEW_DEGREES;
}

function sanitizeScreenFill(screenFill: number): number {
  if (Number.isNaN(screenFill)) return DEFAULT_SCREEN_FILL;
  return Math.min(Math.max(screenFill, MIN_SCREEN_FILL), MAX_SCREEN_FILL);
}

export function getFramingDistance(input: FramingInput): number {
  const isRadiusUsable = Number.isFinite(input.radius) && input.radius > 0;
  if (!isRadiusUsable) return FALLBACK_DISTANCE;

  const halfFieldOfViewRadians =
    (sanitizeFieldOfView(input.fieldOfViewDegrees) * Math.PI) / (2 * HALF_TURN_DEGREES);
  const limitingAspect = Math.min(1, sanitizeAspectRatio(input.aspectRatio));
  const requiredVisibleSize = (2 * input.radius) / sanitizeScreenFill(input.screenFill);
  return requiredVisibleSize / (2 * Math.tan(halfFieldOfViewRadians) * limitingAspect);
}
