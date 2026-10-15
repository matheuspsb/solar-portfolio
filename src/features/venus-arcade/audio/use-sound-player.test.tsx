import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SoundPlayer } from './sound-player';
import { useSoundPlayer } from './use-sound-player';

function createFakePlayer(): SoundPlayer {
  return { setEnabled: vi.fn(), play: vi.fn(), dispose: vi.fn() };
}

describe('useSoundPlayer', () => {
  it('starts muted without touching the audio player', () => {
    const player = createFakePlayer();
    const { result } = renderHook(() => useSoundPlayer(() => player));
    expect(result.current.isSoundOn).toBe(false);
    expect(player.setEnabled).not.toHaveBeenCalled();
  });

  it('turns the sound on and off, telling the player each time', () => {
    const player = createFakePlayer();
    const { result } = renderHook(() => useSoundPlayer(() => player));
    act(() => result.current.toggleSound());
    expect(result.current.isSoundOn).toBe(true);
    expect(player.setEnabled).toHaveBeenLastCalledWith(true);
    act(() => result.current.toggleSound());
    expect(result.current.isSoundOn).toBe(false);
    expect(player.setEnabled).toHaveBeenLastCalledWith(false);
  });

  it('confirms with a sound when it is turned on, and not when it is turned off', () => {
    const player = createFakePlayer();
    const { result } = renderHook(() => useSoundPlayer(() => player));
    act(() => result.current.toggleSound());
    expect(player.play).toHaveBeenCalledTimes(1);
    act(() => result.current.toggleSound());
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  it('forwards the sounds to the player', () => {
    const player = createFakePlayer();
    const { result } = renderHook(() => useSoundPlayer(() => player));
    result.current.play('kill');
    expect(player.play).toHaveBeenCalledWith('kill');
  });

  it('releases the audio on unmount', () => {
    const player = createFakePlayer();
    const { unmount } = renderHook(() => useSoundPlayer(() => player));
    unmount();
    expect(player.dispose).toHaveBeenCalled();
  });
});
