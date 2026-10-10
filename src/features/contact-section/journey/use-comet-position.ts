import { useSyncExternalStore } from 'react';
import type { CometPosition, CometStore } from './comet-store';

export function useCometPosition(store: CometStore): CometPosition {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
