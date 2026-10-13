export type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readStoredText(storage: DraftStorage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStoredText(storage: DraftStorage | null, key: string, text: string): void {
  try {
    storage?.setItem(key, text);
  } catch {
    return;
  }
}

export function removeStoredText(storage: DraftStorage | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    return;
  }
}

export function getLocalStorage(): DraftStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
