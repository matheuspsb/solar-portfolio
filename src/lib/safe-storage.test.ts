import { describe, expect, it } from 'vitest';
import { readStorageItem, removeStorageItem, writeStorageItem } from './safe-storage';
import type { KeyValueStorage } from './safe-storage';

function createFailingStorage(): KeyValueStorage {
  const fail = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

function createMemoryStorage(): KeyValueStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
    removeItem: (key) => {
      items.delete(key);
    },
  };
}

describe('safe storage', () => {
  it('writes, reads back and removes a text', () => {
    const storage = createMemoryStorage();
    writeStorageItem(storage, 'key', 'texto');
    expect(readStorageItem(storage, 'key')).toBe('texto');
    removeStorageItem(storage, 'key');
    expect(readStorageItem(storage, 'key')).toBeNull();
  });

  it('never throws when the browser blocks or fills up the storage', () => {
    const storage = createFailingStorage();
    expect(() => writeStorageItem(storage, 'key', 'texto')).not.toThrow();
    expect(() => removeStorageItem(storage, 'key')).not.toThrow();
    expect(readStorageItem(storage, 'key')).toBeNull();
  });

  it('does nothing when there is no storage at all', () => {
    expect(() => writeStorageItem(null, 'key', 'texto')).not.toThrow();
    expect(() => removeStorageItem(null, 'key')).not.toThrow();
    expect(readStorageItem(null, 'key')).toBeNull();
  });
});
