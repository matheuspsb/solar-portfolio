import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ArcadeSoundInput } from './use-arcade-sounds';
import { useArcadeSounds } from './use-arcade-sounds';

function setup(initial: Omit<ArcadeSoundInput, 'play'>) {
  const play = vi.fn();
  const hook = renderHook(
    (props: Omit<ArcadeSoundInput, 'play'>) => useArcadeSounds({ ...props, play }),
    {
      initialProps: initial,
    },
  );
  return { play, ...hook };
}

const boot = {
  screen: 'boot',
  selectedId: 'bug-hunter',
  rejection: null,
  visibleLines: 0,
} as const;

describe('useArcadeSounds', () => {
  it('is silent when it mounts', () => {
    const { play } = setup(boot);
    expect(play).not.toHaveBeenCalled();
  });

  it('blips for each new boot line and never when lines do not grow', () => {
    const { play, rerender } = setup(boot);
    rerender({ ...boot, visibleLines: 1 });
    rerender({ ...boot, visibleLines: 1 });
    rerender({ ...boot, visibleLines: 3 });
    expect(play).toHaveBeenCalledTimes(2);
    expect(play).toHaveBeenCalledWith('blip');
  });

  it('blips when the selected cartridge changes on the shelf, not when the shelf opens', () => {
    const home = { ...boot, screen: 'home' } as const;
    const { play, rerender } = setup(boot);
    rerender(home);
    expect(play).not.toHaveBeenCalled();
    rerender({ ...home, selectedId: 'sulfur-drift' });
    expect(play).toHaveBeenCalledWith('blip');
  });

  it('plays a hit for every new rejection, even for the same cartridge', () => {
    const home = { ...boot, screen: 'home' } as const;
    const { play, rerender } = setup(home);
    rerender({ ...home, rejection: { id: 'sulfur-drift', reason: 'no-signal' } });
    rerender({ ...home, rejection: null });
    rerender({ ...home, rejection: { id: 'sulfur-drift', reason: 'no-signal' } });
    expect(play.mock.calls.filter(([name]) => name === 'hit')).toHaveLength(2);
  });
});
