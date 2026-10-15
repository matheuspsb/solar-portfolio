import { describe, expect, it } from 'vitest';
import type { KeyValueStorage } from '@/lib/safe-storage';
import { createRunStats } from '../engine/scoring';
import type { FireMode } from '../engine/shots';
import {
  BEST_SCORE_KEY,
  HOTFIX_BEST_SCORE_KEY,
  ROOT_UNLOCKED_KEY,
  readRecords,
  saveRunResult,
} from './records';
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

function resultWith(score: number, previousBest = 0, mode: FireMode = 'standard') {
  return buildRunResult({
    stats: { ...createRunStats(), score },
    end: 'deploy',
    mode,
    previousBest,
  });
}

describe('readRecords', () => {
  it('starts with no best score and the root cartridge sealed', () => {
    expect(readRecords(createStorage().storage, 'standard')).toEqual({
      best: 0,
      isRootUnlocked: false,
    });
  });

  it('reads what was saved under the documented keys', () => {
    const { storage } = createStorage({ [BEST_SCORE_KEY]: '1234', [ROOT_UNLOCKED_KEY]: '1' });
    expect(readRecords(storage, 'standard')).toEqual({ best: 1234, isRootUnlocked: true });
    expect(BEST_SCORE_KEY).toBe('venusArcade.best');
    expect(ROOT_UNLOCKED_KEY).toBe('venusArcade.root');
  });

  it.each(['abc', '-5', '12.5', 'NaN', 'Infinity', '', '1e400'])(
    'ignores the corrupt best score %j',
    (raw) => {
      expect(readRecords(createStorage({ [BEST_SCORE_KEY]: raw }).storage, 'standard').best).toBe(
        0,
      );
    },
  );

  it('only treats the exact flag as unlocked', () => {
    expect(
      readRecords(createStorage({ [ROOT_UNLOCKED_KEY]: 'true' }).storage, 'standard')
        .isRootUnlocked,
    ).toBe(false);
    expect(
      readRecords(createStorage({ [ROOT_UNLOCKED_KEY]: '0' }).storage, 'standard').isRootUnlocked,
    ).toBe(false);
  });

  it.each([
    ['blocked', blockedStorage],
    ['missing', null],
  ])('falls back to empty records when the storage is %s', (_name, storage) => {
    expect(readRecords(storage, 'standard')).toEqual({ best: 0, isRootUnlocked: false });
  });
});

describe('separate records per mode', () => {
  it('keeps one best score for the standard run and another for the hotfix run', () => {
    const { storage } = createStorage();
    saveRunResult(storage, resultWith(1200, 0, 'standard'));
    saveRunResult(storage, resultWith(4000, 0, 'hotfix'));
    expect(readRecords(storage, 'standard').best).toBe(1200);
    expect(readRecords(storage, 'hotfix').best).toBe(4000);
  });

  it('saves the hotfix best under its own key and leaves the standard one alone', () => {
    const { storage, values } = createStorage({ [BEST_SCORE_KEY]: '700' });
    saveRunResult(storage, resultWith(4000, 0, 'hotfix'));
    expect(values.get(BEST_SCORE_KEY)).toBe('700');
    expect(values.get(HOTFIX_BEST_SCORE_KEY)).toBe('4000');
    expect(HOTFIX_BEST_SCORE_KEY).not.toBe(BEST_SCORE_KEY);
  });

  it('never lowers the hotfix best, even if the standard best is higher', () => {
    const { storage, values } = createStorage({
      [BEST_SCORE_KEY]: '9000',
      [HOTFIX_BEST_SCORE_KEY]: '3000',
    });
    saveRunResult(storage, resultWith(500, 0, 'hotfix'));
    expect(values.get(HOTFIX_BEST_SCORE_KEY)).toBe('3000');
    expect(values.get(BEST_SCORE_KEY)).toBe('9000');
  });

  it('shares the root unlock between the modes', () => {
    const { storage } = createStorage();
    saveRunResult(storage, resultWith(5000, 0, 'standard'));
    expect(readRecords(storage, 'hotfix').isRootUnlocked).toBe(true);
  });

  it('ignores a corrupt hotfix best without touching the standard one', () => {
    const { storage } = createStorage({ [BEST_SCORE_KEY]: '700', [HOTFIX_BEST_SCORE_KEY]: 'oops' });
    expect(readRecords(storage, 'hotfix').best).toBe(0);
    expect(readRecords(storage, 'standard').best).toBe(700);
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
