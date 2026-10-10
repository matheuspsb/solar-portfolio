export const LOADER_SEEN_KEY = 'loaderSeen';

export type SeenStorage = Pick<Storage, 'getItem' | 'setItem'>;

const SEEN_VALUE = '1';

export const LOADER_SEEN_SCRIPT = `try {
    if(sessionStorage.getItem('${LOADER_SEEN_KEY}'))
      document.documentElement.dataset.loaderSeen='true'
    }catch(error){}
  `;

export function hasSeenLoader(storage: SeenStorage | null): boolean {
  if (storage === null) return false;
  try {
    return storage.getItem(LOADER_SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

export function markLoaderSeen(storage: SeenStorage | null): void {
  try {
    storage?.setItem(LOADER_SEEN_KEY, SEEN_VALUE);
  } catch {
    return;
  }
}

export function getSessionStorage(): SeenStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
