export type CometPosition = { head: number; tail: number };

export type CometStore = {
  getSnapshot: () => CometPosition;
  subscribe: (listener: () => void) => () => void;
  set: (next: CometPosition) => void;
};

export function createCometStore(initial: CometPosition): CometStore {
  let current = initial;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => current,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set: (next) => {
      if (next.head === current.head && next.tail === current.tail) return;
      current = next;
      for (const listener of listeners) listener();
    },
  };
}
