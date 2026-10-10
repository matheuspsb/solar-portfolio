export const COMET_ENTRY_MS = 1200;
export const COMET_ADVANCE_MS = 950;
export const COMET_RETURN_MS = 750;
export const COMET_RETURN_EXTRA_STEP_MS = 250;
export const COMET_EXIT_MS = 1000;

const FRAMES_PER_SECOND_REFERENCE = 60;
const TAIL_CATCH_UP_PER_FRAME = 0.1;
const TAIL_SNAP_DISTANCE = 1e-4;

export type TweenFrame = { value: number; isFinished: boolean };

export function easeInOutCubic(progress: number): number {
  if (Number.isNaN(progress)) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped < 0.5) return 4 * clamped * clamped * clamped;
  return 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

type TweenInput = {
  from: number;
  to: number;
  startedAt: number;
  durationMs: number;
  now: number;
};

export function getTweenFrame({ from, to, startedAt, durationMs, now }: TweenInput): TweenFrame {
  if (!(durationMs > 0)) return { value: to, isFinished: true };
  const elapsedMs = now - startedAt;
  if (elapsedMs >= durationMs) return { value: to, isFinished: true };
  const eased = easeInOutCubic(elapsedMs / durationMs);
  return { value: from + (to - from) * eased, isFinished: false };
}

type ChaseTailInput = { tail: number; head: number; deltaSeconds: number };

export function chaseTail({ tail, head, deltaSeconds }: ChaseTailInput): number {
  if (!Number.isFinite(head)) return tail;
  if (!Number.isFinite(tail)) return head;
  if (!(deltaSeconds > 0)) return tail;
  const remainingShare = Math.pow(
    1 - TAIL_CATCH_UP_PER_FRAME,
    deltaSeconds * FRAMES_PER_SECOND_REFERENCE,
  );
  const next = head + (tail - head) * remainingShare;
  return Math.abs(head - next) < TAIL_SNAP_DISTANCE ? head : next;
}
