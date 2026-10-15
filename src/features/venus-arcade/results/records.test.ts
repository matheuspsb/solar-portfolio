import { describe, expect, it } from 'vitest';
import type { KeyValueStorage } from '@/lib/safe-storage';
import { createRunStats } from '../engine/scoring';
import { BEST_SCORE_KEY, ROOT_UNLOCKED_KEY, readRecords, saveRunResult } from './records';
import { buildRunResult } from './run-result';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage: KeyValueStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
  return { storage, values };
}

const blockedStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

function resultWith(score: number, previousBest = 0) {
  return buildRunResult({
    stats: { ...createRunStats(), score },
    end: 'deploy',
    previousBest,
  });
}

describe('readRecords', () => {
  it('starts with no best score and the root cartridge sealed', () => {
    expect(readRecords(createStorage().storage)).toEqual({ best: 0, isRootUnlocked: false });
  });

  it('reads what was saved under the documented keys', () => {
    const { storage } = createStorage({ [BEST_SCORE_KEY]: '1234', [ROOT_UNLOCKED_KEY]: '1' });
    expect(readRecords(storage)).toEqual({ best: 1234, isRootUnlocked: true });
    expect(BEST_SCORE_KEY).toBe('venusArcade.best');
    expect(ROOT_UNLOCKED_KEY).toBe('venusArcade.root');
  });

  it.each(['abc', '-5', '12.5', 'NaN', 'Infinity', '', '1e400'])(
    'ignores the corrupt best score %j',
    (raw) => {
      expect(readRecords(createStorage({ [BEST_SCORE_KEY]: raw }).storage).best).toBe(0);
    },
  );

  it('only treats the exact flag as unlocked', () => {
    expect(readRecords(createStorage({ [ROOT_UNLOCKED_KEY]: 'true' }).storage).isRootUnlocked).toBe(
      false,
    );
    expect(readRecords(createStorage({ [ROOT_UNLOCKED_KEY]: '0' }).storage).isRootUnlocked).toBe(
      false,
    );
  });

  it.each([
    ['blocked', blockedStorage],
    ['missing', null],
  ])('falls back to empty records when the storage is %s', (_name, storage) => {
    expect(readRecords(storage)).toEqual({ best: 0, isRootUnlocked: false });
  });
});

describe('saveRunResult', () => {
  it('saves a new best score', () => {
    const { storage, values } = createStorage();
    saveRunResult(storage, resultWith(1500));
    expect(values.get(BEST_SCORE_KEY)).toBe('1500');
  });

  it('never lowers a best score that another tab raised in the meantime', () => {
    const { storage, values } = createStorage({ [BEST_SCORE_KEY]: '9000' });
    saveRunResult(storage, resultWith(500, 0));
    expect(values.get(BEST_SCORE_KEY)).toBe('9000');
  });

  it('unlocks the root cartridge for good once the root score is reached', () => {
    const { storage, values } = createStorage();
    saveRunResult(storage, resultWith(5000));
    expect(values.get(ROOT_UNLOCKED_KEY)).toBe('1');
    saveRunResult(storage, resultWith(100));
    expect(values.get(ROOT_UNLOCKED_KEY)).toBe('1');
  });

  it('leaves the root cartridge sealed below the root score', () => {
    const { storage, values } = createStorage();
    saveRunResult(storage, resultWith(4999));
    expect(values.has(ROOT_UNLOCKED_KEY)).toBe(false);
  });

  it('does not write a zero score', () => {
    const { storage, values } = createStorage();
    saveRunResult(storage, resultWith(0));
    expect(values.has(BEST_SCORE_KEY)).toBe(false);
  });

  it.each([
    ['blocked', blockedStorage],
    ['missing', null],
  ])('does not throw when the storage is %s', (_name, storage) => {
    expect(() => saveRunResult(storage, resultWith(5000))).not.toThrow();
  });
});
