import { useEffect, useRef } from 'react';
import type { ArcadeFlow } from '../flow/arcade-flow';
import type { SoundName } from './sound-specs';

export type ArcadeSoundInput = {
  screen: ArcadeFlow['screen'];
  selectedId: ArcadeFlow['selectedId'];
  rejection: ArcadeFlow['rejection'];
  visibleLines: number;
  play: (name: SoundName) => void;
};

export function useArcadeSounds({
  screen,
  selectedId,
  rejection,
  visibleLines,
  play,
}: ArcadeSoundInput): void {
  const previous = useRef({ screen, selectedId, rejection, visibleLines });

  useEffect(() => {
    const last = previous.current;
    previous.current = { screen, selectedId, rejection, visibleLines };
    if (screen === 'boot' && visibleLines > last.visibleLines) play('blip');
    if (screen === 'home' && last.screen === 'home' && selectedId !== last.selectedId) play('blip');
    if (rejection !== null && rejection !== last.rejection) play('hit');
  }, [screen, selectedId, rejection, visibleLines, play]);
}
