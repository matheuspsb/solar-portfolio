import { useEffect, useState } from 'react';
import { createSoundPlayer } from './sound-player';
import type { SoundPlayer } from './sound-player';
import type { SoundName } from './sound-specs';

type SoundPlayerApi = {
  isSoundOn: boolean;
  toggleSound: () => void;
  play: (name: SoundName) => void;
};

export function useSoundPlayer(
  createPlayer: () => SoundPlayer = createSoundPlayer,
): SoundPlayerApi {
  const [player] = useState(createPlayer);
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => () => player.dispose(), [player]);

  const toggleSound = () => {
    const next = !isSoundOn;
    player.setEnabled(next);
    setIsSoundOn(next);
    if (next) player.play('pick');
  };

  return { isSoundOn, toggleSound, play: (name) => player.play(name) };
}
