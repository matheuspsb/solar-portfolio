import { act, renderHook, waitFor } from '@testing-library/react';
import { Texture } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { useTexture } from './use-texture';

function createDeferredLoader() {
  const resolvers: Array<{
    url: string;
    resolve: (texture: Texture) => void;
    reject: (error: Error) => void;
  }> = [];
  const load = (url: string) =>
    new Promise<Texture>((resolve, reject) => {
      resolvers.push({ url, resolve, reject });
    });
  return { load, resolvers };
}

describe('useTexture', () => {
  it('stays idle without a url', () => {
    const load = vi.fn();
    const { result } = renderHook(() => useTexture(null, load));
    expect(result.current).toEqual({ texture: null, status: 'idle' });
    expect(load).not.toHaveBeenCalled();
  });

  it('reports loading and then the loaded texture', async () => {
    const loader = createDeferredLoader();
    const { result } = renderHook(() => useTexture('/sun.webp', loader.load));
    expect(result.current.status).toBe('loading');
    const texture = new Texture();
    await act(async () => loader.resolvers[0]!.resolve(texture));
    expect(result.current).toEqual({ texture, status: 'loaded' });
  });

  it('reports an error status and no texture when loading fails', async () => {
    const loader = createDeferredLoader();
    const { result } = renderHook(() => useTexture('/missing.webp', loader.load));
    await act(async () => loader.resolvers[0]!.reject(new Error('404')));
    expect(result.current).toEqual({ texture: null, status: 'error' });
  });

  it('disposes the texture on unmount', async () => {
    const loader = createDeferredLoader();
    const { result, unmount } = renderHook(() => useTexture('/sun.webp', loader.load));
    const texture = new Texture();
    const disposeSpy = vi.spyOn(texture, 'dispose');
    await act(async () => loader.resolvers[0]!.resolve(texture));
    expect(result.current.texture).toBe(texture);
    unmount();
    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it('disposes a texture that finishes loading after unmount', async () => {
    const loader = createDeferredLoader();
    const { unmount } = renderHook(() => useTexture('/sun.webp', loader.load));
    unmount();
    const texture = new Texture();
    const disposeSpy = vi.spyOn(texture, 'dispose');
    await act(async () => loader.resolvers[0]!.resolve(texture));
    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it('ignores a stale load when the url changes and disposes it', async () => {
    const loader = createDeferredLoader();
    const { result, rerender } = renderHook(({ url }) => useTexture(url, loader.load), {
      initialProps: { url: '/first.webp' },
    });
    rerender({ url: '/second.webp' });
    const staleTexture = new Texture();
    const freshTexture = new Texture();
    const staleDispose = vi.spyOn(staleTexture, 'dispose');
    await act(async () => loader.resolvers[0]!.resolve(staleTexture));
    expect(result.current.texture).toBeNull();
    expect(staleDispose).toHaveBeenCalledOnce();
    await act(async () => loader.resolvers[1]!.resolve(freshTexture));
    await waitFor(() => expect(result.current.texture).toBe(freshTexture));
  });

  it('returns to idle and disposes when the url becomes null', async () => {
    const loader = createDeferredLoader();
    const { result, rerender } = renderHook(({ url }) => useTexture(url, loader.load), {
      initialProps: { url: '/sun.webp' as string | null },
    });
    const texture = new Texture();
    const disposeSpy = vi.spyOn(texture, 'dispose');
    await act(async () => loader.resolvers[0]!.resolve(texture));
    rerender({ url: null });
    expect(result.current).toEqual({ texture: null, status: 'idle' });
    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  describe('onSettled', () => {
    it('is called once when the texture loads', async () => {
      const loader = createDeferredLoader();
      const onSettled = vi.fn();
      renderHook(() => useTexture('/sun.webp', loader.load, onSettled));
      expect(onSettled).not.toHaveBeenCalled();
      await act(async () => loader.resolvers[0]!.resolve(new Texture()));
      expect(onSettled).toHaveBeenCalledOnce();
    });

    it('is called once when the load fails, so nothing waits forever', async () => {
      const loader = createDeferredLoader();
      const onSettled = vi.fn();
      renderHook(() => useTexture('/missing.webp', loader.load, onSettled));
      await act(async () => loader.resolvers[0]!.reject(new Error('404')));
      expect(onSettled).toHaveBeenCalledOnce();
    });

    it('is called at once when there is no texture to wait for', () => {
      const onSettled = vi.fn();
      renderHook(() => useTexture(null, vi.fn(), onSettled));
      expect(onSettled).toHaveBeenCalledOnce();
    });

    it('is not called for a load that was cancelled by a new url or by unmounting', async () => {
      const loader = createDeferredLoader();
      const onSettled = vi.fn();
      const { rerender, unmount } = renderHook(
        ({ url }) => useTexture(url, loader.load, onSettled),
        { initialProps: { url: '/first.webp' } },
      );
      rerender({ url: '/second.webp' });
      await act(async () => loader.resolvers[0]!.resolve(new Texture()));
      expect(onSettled).not.toHaveBeenCalled();
      unmount();
      await act(async () => loader.resolvers[1]!.resolve(new Texture()));
      expect(onSettled).not.toHaveBeenCalled();
    });

    it('is not called for a load that fails after it was cancelled', async () => {
      const loader = createDeferredLoader();
      const onSettled = vi.fn();
      const { unmount } = renderHook(() => useTexture('/missing.webp', loader.load, onSettled));
      unmount();
      await act(async () => loader.resolvers[0]!.reject(new Error('404')));
      expect(onSettled).not.toHaveBeenCalled();
    });

    it('is not called again when the caller passes a new callback on every render', async () => {
      const loader = createDeferredLoader();
      const calls: number[] = [];
      const { rerender } = renderHook(() =>
        useTexture('/sun.webp', loader.load, () => calls.push(1)),
      );
      await act(async () => loader.resolvers[0]!.resolve(new Texture()));
      rerender();
      rerender();
      expect(calls).toHaveLength(1);
    });
  });
});
