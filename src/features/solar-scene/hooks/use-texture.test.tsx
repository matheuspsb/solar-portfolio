// Use case: the Sun's surface texture loads asynchronously. Visitors must see the Sun even if
// the file fails (404, offline), and switching/unmounting mid-load must not leak GPU memory or
// update unmounted components.
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
});
