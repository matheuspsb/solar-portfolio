export type SoundSpec = {
  wave: OscillatorType;
  fromHertz: number;
  toHertz: number;
  seconds: number;
  volume: number;
};

export const SOUND_SPECS = {
  shoot: { wave: 'square', fromHertz: 900, toHertz: 500, seconds: 0.04, volume: 0.01 },
  kill: { wave: 'square', fromHertz: 520, toHertz: 90, seconds: 0.12, volume: 0.05 },
  hit: { wave: 'sawtooth', fromHertz: 160, toHertz: 40, seconds: 0.35, volume: 0.08 },
  pick: { wave: 'triangle', fromHertz: 600, toHertz: 1200, seconds: 0.18, volume: 0.06 },
  blip: { wave: 'square', fromHertz: 660, toHertz: 640, seconds: 0.06, volume: 0.035 },
  boot: { wave: 'triangle', fromHertz: 140, toHertz: 720, seconds: 0.9, volume: 0.06 },
  end: { wave: 'triangle', fromHertz: 440, toHertz: 880, seconds: 0.5, volume: 0.06 },
} as const satisfies Record<string, SoundSpec>;

export type SoundName = keyof typeof SOUND_SPECS;
