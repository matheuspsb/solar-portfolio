import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loaderContent } from '@/content/loader';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { LOADER_SEEN_KEY } from '@/lib/loader-seen';
import type { SeenStorage } from '@/lib/loader-seen';
import { TOTAL_REAL_SECONDS } from '../lib/timeline';
import { LoadingGate } from './LoadingGate';

const FRAME_MS = 1000 / 60;
const FULL_RUN_SECONDS = TOTAL_REAL_SECONDS + 1;

function createManualScheduler() {
  let currentTime = 0;
  let nextHandle = 1;
  const pending = new Map<number, (now: number) => void>();
  const scheduler: FrameScheduler = {
    now: () => currentTime,
    request: (callback) => {
      const handle = nextHandle;
      nextHandle += 1;
      pending.set(handle, callback);
      return handle;
    },
    cancel: (handle) => {
      pending.delete(handle);
    },
  };
  const play = (seconds: number) => {
    act(() => {
      for (let frame = 0; frame < Math.round((seconds * 1000) / FRAME_MS); frame += 1) {
        currentTime += FRAME_MS;
        const callbacks = [...pending.values()];
        pending.clear();
        for (const callback of callbacks) callback(currentTime);
      }
    });
  };
  return { scheduler, play, pendingCount: () => pending.size };
}

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage = {
    writes: 0,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.writes += 1;
      values.set(key, value);
    },
  };
  return storage;
}

const throwingStorage: SeenStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

function stubReducedMotion(isReduced: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: isReduced && query.includes('reduce'),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

function setup(
  options: {
    isSceneReady?: boolean;
    storage?: SeenStorage | null;
  } = {},
) {
  const clock = createManualScheduler();
  const storage = options.storage === undefined ? createStorage() : options.storage;
  const view = render(
    <LoadingGate
      isSceneReady={options.isSceneReady ?? true}
      storage={storage}
      scheduler={clock.scheduler}
    />,
  );
  return { ...clock, ...view, storage };
}

const skipButton = () => screen.getByRole('button', { name: loaderContent.skipLabel });
const dialog = () => screen.queryByRole('dialog');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LoadingGate', () => {
  it('shows nothing when the visitor already saw the loader', () => {
    setup({ storage: createStorage({ [LOADER_SEEN_KEY]: '1' }) });
    expect(dialog()).toBeNull();
  });

  it('puts the keyboard on the skip button when it opens and keeps it there on Tab', async () => {
    const user = userEvent.setup();
    setup();
    expect(dialog()).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(skipButton()).toHaveFocus();
    await user.tab();
    await user.tab({ shift: true });
    expect(skipButton()).toHaveFocus();
  });

  it('remembers the visit once and leaves the screen after a full run', () => {
    const storage = createStorage();
    const { play } = setup({ storage });
    play(FULL_RUN_SECONDS);
    expect(dialog()).toBeNull();
    expect(storage.writes).toBe(1);
  });

  it('keeps waiting while the scene is not ready', () => {
    const storage = createStorage();
    const { play } = setup({ isSceneReady: false, storage });
    play(10);
    expect(dialog()).toBeInTheDocument();
    expect(storage.writes).toBe(0);
  });

  it('skips with Escape, even pressed repeatedly, and finishes only once', async () => {
    const user = userEvent.setup();
    const storage = createStorage();
    const { play } = setup({ isSceneReady: false, storage });
    await user.keyboard('{Escape}{Escape}{Escape}');
    play(3);
    expect(dialog()).toBeNull();
    expect(storage.writes).toBe(1);
  });

  it('skips with the button', async () => {
    const user = userEvent.setup();
    const { play } = setup({ isSceneReady: false });
    await user.click(skipButton());
    play(3);
    expect(dialog()).toBeNull();
  });

  it('ignores Escape once it is gone', async () => {
    const user = userEvent.setup();
    const storage = createStorage();
    const { play } = setup({ storage });
    play(FULL_RUN_SECONDS);
    await user.keyboard('{Escape}');
    expect(storage.writes).toBe(1);
  });

  it.each([
    ['blocked', throwingStorage],
    ['missing', null],
  ])('still runs and finishes when the storage is %s', (_name, storage) => {
    const { play } = setup({ storage });
    play(FULL_RUN_SECONDS);
    expect(dialog()).toBeNull();
  });

  describe('with reduced motion', () => {
    it('does not animate: no frames are scheduled', () => {
      stubReducedMotion(true);
      const { pendingCount } = setup({ isSceneReady: false });
      expect(dialog()).toBeInTheDocument();
      expect(pendingCount()).toBe(0);
    });

    it('leaves as soon as the scene is ready', () => {
      stubReducedMotion(true);
      setup({ isSceneReady: true });
      expect(dialog()).toBeNull();
    });

    it('can still be skipped while waiting', async () => {
      stubReducedMotion(true);
      const user = userEvent.setup();
      setup({ isSceneReady: false });
      await user.click(skipButton());
      expect(dialog()).toBeNull();
    });
  });
});
