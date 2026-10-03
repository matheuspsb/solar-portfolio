// Use case: some browsers/devices (old phones, blocklisted GPUs, privacy modes) have no WebGL.
// Detection must answer false instead of throwing, otherwise the whole page would crash for those
// recruiters instead of falling back to the plain content.
import { describe, expect, it, vi } from 'vitest';
import { detectWebGL } from './webgl-support';

type FakeCanvas = {
  getContext: (contextId: string) => object | null;
};

const supportingCanvas = (): FakeCanvas => ({ getContext: () => ({}) });

describe('detectWebGL', () => {
  it('is true when a WebGL context can be created', () => {
    expect(detectWebGL(supportingCanvas)).toBe(true);
  });

  it('is false when no context is available', () => {
    expect(detectWebGL(() => ({ getContext: () => null }))).toBe(false);
  });

  it('is false when creating the canvas throws', () => {
    expect(
      detectWebGL(() => {
        throw new Error('no DOM');
      }),
    ).toBe(false);
  });

  it('is false when getContext throws (blocked by policy)', () => {
    expect(
      detectWebGL(() => ({
        getContext: () => {
          throw new Error('blocked');
        },
      })),
    ).toBe(false);
  });

  it('prefers webgl2 but accepts webgl 1', () => {
    const getContext = vi.fn((contextId: string) => (contextId === 'webgl' ? {} : null));
    expect(detectWebGL(() => ({ getContext }))).toBe(true);
    expect(getContext).toHaveBeenCalledWith('webgl2');
    expect(getContext).toHaveBeenCalledWith('webgl');
  });

  it('releases the probe context so it does not count against the browser limit', () => {
    const loseContext = vi.fn();
    const context = {
      getExtension: (name: string) => (name === 'WEBGL_lose_context' ? { loseContext } : null),
    };
    expect(detectWebGL(() => ({ getContext: () => context }))).toBe(true);
    expect(loseContext).toHaveBeenCalledOnce();
  });

  it('still reports support when the context has no lose-context extension', () => {
    const context = { getExtension: () => null };
    expect(detectWebGL(() => ({ getContext: () => context }))).toBe(true);
  });

  it('still reports support when releasing the context throws', () => {
    const context = {
      getExtension: () => ({
        loseContext: () => {
          throw new Error('already lost');
        },
      }),
    };
    expect(detectWebGL(() => ({ getContext: () => context }))).toBe(true);
  });
});
