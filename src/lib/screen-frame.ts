export type ScreenFrame = { x: number; y: number; radius: number };

export type FrameChannel = {
  publish: (frame: ScreenFrame | null) => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ScreenFrame | null;
};

function isSameFrame(first: ScreenFrame | null, second: ScreenFrame | null): boolean {
  if (first === second) return true;
  if (first === null || second === null) return false;
  return first.x === second.x && first.y === second.y && first.radius === second.radius;
}

export function createFrameChannel(): FrameChannel {
  let current: ScreenFrame | null = null;
  const listeners = new Set<() => void>();

  return {
    publish: (frame) => {
      if (isSameFrame(current, frame)) return;
      current = frame;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => current,
  };
}
