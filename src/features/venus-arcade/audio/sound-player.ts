import { SOUND_SPECS } from './sound-specs';
import type { SoundName } from './sound-specs';

const SILENT_LEVEL = 0.0001;
const STOP_MARGIN_SECONDS = 0.02;

type ParamLike = {
  setValueAtTime: (value: number, time: number) => unknown;
  exponentialRampToValueAtTime: (value: number, time: number) => unknown;
};

export type AudioContextLike = {
  currentTime: number;
  state: AudioContextState;
  destination: AudioNode;
  resume: () => Promise<void>;
  close: () => Promise<void>;
  createOscillator: () => {
    type: OscillatorType;
    frequency: ParamLike;
    connect: (destination: AudioNode | unknown) => unknown;
    start: (time: number) => void;
    stop: (time: number) => void;
  };
  createGain: () => { gain: ParamLike; connect: (destination: AudioNode | unknown) => unknown };
};

export type SoundPlayer = {
  setEnabled: (isEnabled: boolean) => void;
  play: (name: SoundName) => void;
  dispose: () => void;
};

type AudioContextFactory = () => AudioContextLike;

function createBrowserContext(): AudioContextLike {
  return new window.AudioContext() as unknown as AudioContextLike;
}

export function createSoundPlayer(
  createContext: AudioContextFactory = createBrowserContext,
): SoundPlayer {
  let context: AudioContextLike | null = null;
  let isEnabled = false;
  let hasFailed = false;
  let isDisposed = false;

  const ensureContext = (): AudioContextLike | null => {
    if (context !== null) return context;
    if (hasFailed || isDisposed) return null;
    try {
      context = createContext();
    } catch {
      hasFailed = true;
    }
    return context;
  };

  const playTone = (audio: AudioContextLike, name: SoundName) => {
    const spec = SOUND_SPECS[name];
    const now = audio.currentTime;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = spec.wave;
    oscillator.frequency.setValueAtTime(spec.fromHertz, now);
    oscillator.frequency.exponentialRampToValueAtTime(spec.toHertz, now + spec.seconds);
    gain.gain.setValueAtTime(spec.volume, now);
    gain.gain.exponentialRampToValueAtTime(SILENT_LEVEL, now + spec.seconds);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + spec.seconds + STOP_MARGIN_SECONDS);
  };

  return {
    setEnabled(next) {
      isEnabled = next;
      if (!next) return;
      const audio = ensureContext();
      if (audio?.state === 'suspended') void audio.resume().catch(() => undefined);
    },
    play(name) {
      if (!isEnabled) return;
      const audio = ensureContext();
      if (audio === null) return;
      try {
        playTone(audio, name);
      } catch {
        hasFailed = true;
      }
    },
    dispose() {
      isDisposed = true;
      isEnabled = false;
      void context?.close().catch(() => undefined);
      context = null;
    },
  };
}
