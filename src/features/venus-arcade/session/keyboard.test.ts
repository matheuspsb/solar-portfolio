import { describe, expect, it } from 'vitest';
import { getKeyboardDirection, interpretKey, normalizeKey, trackKey } from './keyboard';
import type { SessionPhase } from './session';

function pressed(...keys: string[]): ReadonlySet<string> {
  return new Set(keys);
}

describe('normalizeKey', () => {
  it('ignores the case and names the space bar', () => {
    expect(normalizeKey('W')).toBe('w');
    expect(normalizeKey('ArrowLeft')).toBe('arrowleft');
    expect(normalizeKey(' ')).toBe('space');
    expect(normalizeKey('Escape')).toBe('escape');
  });
});

describe('trackKey', () => {
  it('adds a key that goes down and removes it when it goes up', () => {
    const down = trackKey(new Set(), 'W', true);
    expect([...down]).toEqual(['w']);
    expect([...trackKey(down, 'w', false)]).toEqual([]);
  });

  it('does not change the set it was given', () => {
    const before = pressed('w');
    trackKey(before, 'a', true);
    expect([...before]).toEqual(['w']);
  });

  it('ignores keys that do not move the drone', () => {
    expect([...trackKey(new Set(), 'q', true)]).toEqual([]);
  });
});

describe('getKeyboardDirection', () => {
  it.each([
    [['w'], { x: 0, y: -1 }],
    [['arrowup'], { x: 0, y: -1 }],
    [['s'], { x: 0, y: 1 }],
    [['arrowdown'], { x: 0, y: 1 }],
    [['a'], { x: -1, y: 0 }],
    [['arrowleft'], { x: -1, y: 0 }],
    [['d'], { x: 1, y: 0 }],
    [['arrowright'], { x: 1, y: 0 }],
    [['w', 'd'], { x: 1, y: -1 }],
    [[], { x: 0, y: 0 }],
  ])('turns %j into %j', (keys, expected) => {
    expect(getKeyboardDirection(pressed(...keys))).toEqual(expected);
  });

  it('cancels opposite keys, including a letter against an arrow', () => {
    expect(getKeyboardDirection(pressed('a', 'd'))).toEqual({ x: 0, y: 0 });
    expect(getKeyboardDirection(pressed('arrowleft', 'd'))).toEqual({ x: 0, y: 0 });
    expect(getKeyboardDirection(pressed('w', 's', 'a'))).toEqual({ x: -1, y: 0 });
  });

  it('counts a letter and its arrow as a single push', () => {
    expect(getKeyboardDirection(pressed('d', 'arrowright'))).toEqual({ x: 1, y: 0 });
  });
});

describe('interpretKey', () => {
  const command = (phase: SessionPhase, key: string) => interpretKey({ key, phase });

  it('toggles the sound in every phase', () => {
    const phases: SessionPhase[] = [
      'title',
      'countdown',
      'running',
      'paused',
      'ending',
      'finished',
    ];
    for (const phase of phases) expect(command(phase, 'm')).toBe('toggleSound');
  });

  it('starts from the title with Enter or Space and leaves with Escape', () => {
    expect(command('title', 'enter')).toBe('begin');
    expect(command('title', 'space')).toBe('begin');
    expect(command('title', 'escape')).toBe('quit');
    expect(command('title', 'r')).toBeNull();
  });

  it('pauses a running game with Escape or P and restarts it with R', () => {
    expect(command('running', 'escape')).toBe('pause');
    expect(command('running', 'p')).toBe('pause');
    expect(command('running', 'r')).toBe('restart');
    expect(command('running', 'q')).toBeNull();
    expect(command('running', 'enter')).toBeNull();
  });

  it('resumes, restarts or quits from the pause', () => {
    expect(command('paused', 'escape')).toBe('resume');
    expect(command('paused', 'p')).toBe('resume');
    expect(command('paused', 'r')).toBe('restart');
    expect(command('paused', 'q')).toBe('quit');
  });

  it('plays again or goes back from the results', () => {
    expect(command('finished', 'r')).toBe('restart');
    expect(command('finished', 'enter')).toBe('restart');
    expect(command('finished', 'escape')).toBe('quit');
  });

  it('ignores the keys during the countdown and the ending banner', () => {
    for (const key of ['escape', 'p', 'r', 'enter', 'q', 'space']) {
      expect(command('countdown', key)).toBeNull();
      expect(command('ending', key)).toBeNull();
    }
  });

  it('ignores unknown keys', () => {
    expect(command('running', 'f5')).toBeNull();
    expect(command('running', '')).toBeNull();
  });
});
