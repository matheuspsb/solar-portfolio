export const FULL_TURN_RADIANS = Math.PI * 2;

/** Caps one frame's contribution so a long-suspended tab resumes smoothly instead of jumping. */
export const MAX_FRAME_DELTA_SECONDS = 0.1;

type AdvanceRotationInput = {
  angle: number;
  deltaSeconds: number;
  periodSeconds: number;
};

function normalizeAngle(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return ((angle % FULL_TURN_RADIANS) + FULL_TURN_RADIANS) % FULL_TURN_RADIANS;
}

export function clampFrameDelta(deltaSeconds: number): number {
  if (Number.isNaN(deltaSeconds) || deltaSeconds < 0) return 0;
  return Math.min(deltaSeconds, MAX_FRAME_DELTA_SECONDS);
}

export function advanceRotation({
  angle,
  deltaSeconds,
  periodSeconds,
}: AdvanceRotationInput): number {
  const currentAngle = normalizeAngle(angle);
  const isPeriodValid = Number.isFinite(periodSeconds) && periodSeconds > 0;
  if (!isPeriodValid) return currentAngle;

  const radiansPerSecond = FULL_TURN_RADIANS / periodSeconds;
  return normalizeAngle(currentAngle + radiansPerSecond * clampFrameDelta(deltaSeconds));
}
