import { readStorageItem, writeStorageItem } from '@/lib/safe-storage';
import type { KeyValueStorage } from '@/lib/safe-storage';
import type { RunResult } from './run-result';

export const BEST_SCORE_KEY = 'venusArcade.best';
export const ROOT_UNLOCKED_KEY = 'venusArcade.root';

const ROOT_UNLOCKED_VALUE = '1';

export type ArcadeRecords = { best: number; isRootUnlocked: boolean };

type RecordsStorage = Pick<KeyValueStorage, 'getItem' | 'setItem'> | null;

function parseBest(raw: string | null): number {
  if (raw === null || raw.trim() === '') return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

export function readRecords(storage: RecordsStorage): ArcadeRecords {
  return {
    best: parseBest(readStorageItem(storage, BEST_SCORE_KEY)),
    isRootUnlocked: readStorageItem(storage, ROOT_UNLOCKED_KEY) === ROOT_UNLOCKED_VALUE,
  };
}

export function saveRunResult(storage: RecordsStorage, result: RunResult): void {
  const storedBest = parseBest(readStorageItem(storage, BEST_SCORE_KEY));
  const best = Math.max(storedBest, result.nextBest);
  if (best > 0 && best !== storedBest) writeStorageItem(storage, BEST_SCORE_KEY, String(best));
  if (result.reachedRoot) writeStorageItem(storage, ROOT_UNLOCKED_KEY, ROOT_UNLOCKED_VALUE);
}
