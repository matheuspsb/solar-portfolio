import { describe, expect, it, vi } from 'vitest';
import { SOUND_SPECS } from './sound-specs';
import { createSoundPlayer } from './sound-player';
import type { AudioContextLike } from './sound-player';

function createFakeContext(state: AudioContextState = 'running') {
  const oscillators: {
    type: string;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    frequency: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  }[] = [];
  const gains: {
    gain: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
    };
  }[] = [];
  const raw = {
    currentTime: 10,
    state,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
    createOscillator: vi.fn(() => {
      const oscillator = {
        type: '',
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      };
      oscillators.push(oscillator);
      return oscillator;
    }),
    createGain: vi.fn(() => {
      const gain = {
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      };
      gains.push(gain);
      return gain;
    }),
  };
  return { context: raw as unknown as AudioContextLike, raw, oscillators, gains };
}

describe('createSoundPlayer', () => {
  it('stays silent and creates no audio context until the sound is turned on', () => {
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const player = createSoundPlayer(createContext);
    player.play('shoot');
    expect(createContext).not.toHaveBeenCalled();
    expect(fake.oscillators).toEqual([]);
  });

  it('creates the context when the sound is turned on and resumes a suspended one', () => {
    const fake = createFakeContext('suspended');
    const createContext = vi.fn(() => fake.context);
    const player = createSoundPlayer(createContext);
    player.setEnabled(true);
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(fake.raw.resume).toHaveBeenCalled();
  });

  it('plays the described tone: shape, sweep, level and stop time', () => {
    const fake = createFakeContext();
    const player = createSoundPlayer(() => fake.context);
    player.setEnabled(true);
    player.play('kill');
    const spec = SOUND_SPECS.kill;
    const [oscillator] = fake.oscillators;
    const [gain] = fake.gains;
    expect(oscillator!.type).toBe(spec.wave);
    expect(oscillator!.frequency.setValueAtTime).toHaveBeenCalledWith(spec.fromHertz, 10);
    expect(oscillator!.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      spec.toHertz,
      10 + spec.seconds,
    );
    expect(gain!.gain.setValueAtTime).toHaveBeenCalledWith(spec.volume, 10);
    expect(oscillator!.start).toHaveBeenCalledWith(10);
    expect(oscillator!.stop.mock.calls[0]![0]).toBeGreaterThan(10 + spec.seconds);
  });

  it('reuses the context across sounds', () => {
    const fake = createFakeContext();
    const createContext = vi.fn(() => fake.context);
    const player = createSoundPlayer(createContext);
    player.setEnabled(true);
    player.play('blip');
    player.play('pick');
    expect(createContext).toHaveBeenCalledTimes(1);
    expect(fake.oscillators).toHaveLength(2);
  });

  it('goes silent again when turned off', () => {
    const fake = createFakeContext();
    const player = createSoundPlayer(() => fake.context);
    player.setEnabled(true);
    player.setEnabled(false);
    player.play('hit');
    expect(fake.oscillators).toEqual([]);
  });

  it('survives a browser without audio and does not retry on every sound', () => {
    const createContext = vi.fn(() => {
      throw new Error('no audio');
    });
    const player = createSoundPlayer(createContext);
    expect(() => player.setEnabled(true)).not.toThrow();
    expect(() => player.play('hit')).not.toThrow();
    expect(createContext).toHaveBeenCalledTimes(1);
  });

  it('survives a context that throws while playing', () => {
    const fake = createFakeContext();
    fake.raw.createOscillator.mockImplementation(() => {
      throw new Error('closed');
    });
    const player = createSoundPlayer(() => fake.context);
    player.setEnabled(true);
    expect(() => player.play('hit')).not.toThrow();
  });

  it('closes the context on dispose and stays silent after it', () => {
    const fake = createFakeContext();
    const player = createSoundPlayer(() => fake.context);
    player.setEnabled(true);
    player.dispose();
    expect(fake.raw.close).toHaveBeenCalled();
    player.play('hit');
    expect(fake.oscillators).toEqual([]);
  });
});
