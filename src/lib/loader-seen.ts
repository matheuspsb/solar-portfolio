import { readStorageItem, writeStorageItem } from './safe-storage';

export const LOADER_SEEN_KEY = 'loaderSeen';

export type SeenStorage = Pick<Storage, 'getItem' | 'setItem'>;

const SEEN_VALUE = '1';

export const LOADER_SEEN_SCRIPT = `try {
    if(sessionStorage.getItem('${LOADER_SEEN_KEY}'))
      document.documentElement.dataset.loaderSeen='true'
    }catch(error){}
  `;

export function hasSeenLoader(storage: SeenStorage | null): boolean {
  return readStorageItem(storage, LOADER_SEEN_KEY) !== null;
}

export function markLoaderSeen(storage: SeenStorage | null): void {
  writeStorageItem(storage, LOADER_SEEN_KEY, SEEN_VALUE);
}
