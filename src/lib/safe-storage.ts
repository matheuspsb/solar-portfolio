export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readStorageItem(
  storage: Pick<Storage, 'getItem'> | null,
  key: string,
): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorageItem(
  storage: Pick<Storage, 'setItem'> | null,
  key: string,
  value: string,
): void {
  try {
    storage?.setItem(key, value);
  } catch {
    return;
  }
}

export function removeStorageItem(storage: Pick<Storage, 'removeItem'> | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    return;
  }
}

export function getLocalStorage(): KeyValueStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getSessionStorage(): KeyValueStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
