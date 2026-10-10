export const HONEYPOT_FIELD = 'homepage';
export const MIN_FILL_MS = 2000;

export type BotSignals = { homepage: string; elapsedMs: number };
export type BotVerdict = 'human' | 'honeypot' | 'too-fast' | 'missing-signals';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function judgeSubmission(input: unknown): BotVerdict {
  if (!isRecord(input)) return 'missing-signals';

  const homepage = input[HONEYPOT_FIELD];
  if (typeof homepage === 'string' && homepage !== '') return 'honeypot';

  const elapsedMs = input.elapsedMs;
  if (
    typeof homepage !== 'string' ||
    typeof elapsedMs !== 'number' ||
    !Number.isFinite(elapsedMs)
  ) {
    return 'missing-signals';
  }
  return elapsedMs < MIN_FILL_MS ? 'too-fast' : 'human';
}
