import { describe, expect, it } from 'vitest';
import { LOADER_SEEN_KEY, LOADER_SEEN_SCRIPT, hasSeenLoader, markLoaderSeen } from './loader-seen';
import type { SeenStorage } from './loader-seen';

function createStorage(initial: Record<string, string> = {}): SeenStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

const throwingStorage: SeenStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('hasSeenLoader and markLoaderSeen', () => {
  it('remembers a visit', () => {
    const storage = createStorage();
    expect(hasSeenLoader(storage)).toBe(false);
    markLoaderSeen(storage);
    expect(hasSeenLoader(storage)).toBe(true);
  });

  it('treats a missing or blocked storage as an unseen loader without throwing', () => {
    expect(hasSeenLoader(null)).toBe(false);
    expect(hasSeenLoader(throwingStorage)).toBe(false);
    expect(() => markLoaderSeen(throwingStorage)).not.toThrow();
    expect(() => markLoaderSeen(null)).not.toThrow();
  });
});

describe('LOADER_SEEN_SCRIPT', () => {
  function run(storage: SeenStorage | 'throws'): Record<string, string> {
    const dataset: Record<string, string> = {};
    const fakeDocument = { documentElement: { dataset } };
    const fakeStorage = storage === 'throws' ? throwingStorage : storage;
    new Function('sessionStorage', 'document', LOADER_SEEN_SCRIPT)(fakeStorage, fakeDocument);
    return dataset;
  }

  it('flags the page before hydration when the loader was already seen', () => {
    expect(run(createStorage({ [LOADER_SEEN_KEY]: '1' }))).toEqual({ loaderSeen: 'true' });
  });

  it('leaves the page alone on a first visit', () => {
    expect(run(createStorage())).toEqual({});
  });

  it('never breaks the page when the storage is blocked', () => {
    expect(run('throws')).toEqual({});
  });
});
