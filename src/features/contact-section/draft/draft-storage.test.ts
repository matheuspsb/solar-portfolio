import { describe, expect, it } from 'vitest';
import { readStoredText, removeStoredText, writeStoredText } from './draft-storage';
import type { DraftStorage } from './draft-storage';

function createFailingStorage(): DraftStorage {
  const fail = () => {
    throw new DOMException('blocked', 'SecurityError');
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
}

function createMemoryStorage(): DraftStorage {
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

describe('draft storage', () => {
  it('writes, reads back and removes a text', () => {
    const storage = createMemoryStorage();
    writeStoredText(storage, 'draft', 'texto');
    expect(readStoredText(storage, 'draft')).toBe('texto');
    removeStoredText(storage, 'draft');
    expect(readStoredText(storage, 'draft')).toBeNull();
  });

  it('keeps the form working when the browser blocks or fills up the storage', () => {
    const storage = createFailingStorage();
    expect(() => writeStoredText(storage, 'draft', 'texto')).not.toThrow();
    expect(() => removeStoredText(storage, 'draft')).not.toThrow();
    expect(readStoredText(storage, 'draft')).toBeNull();
  });

  it('does nothing when there is no storage at all', () => {
    expect(() => writeStoredText(null, 'draft', 'texto')).not.toThrow();
    expect(() => removeStoredText(null, 'draft')).not.toThrow();
    expect(readStoredText(null, 'draft')).toBeNull();
  });
});
