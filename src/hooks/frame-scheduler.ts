export type FrameScheduler = {
  now: () => number;
  request: (callback: (now: number) => void) => number;
  cancel: (handle: number) => void;
};

export const browserFrameScheduler: FrameScheduler = {
  now: () => performance.now(),
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle),
};
