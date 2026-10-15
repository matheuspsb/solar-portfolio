'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { arcadeContent } from '@/content/arcade';
import { useModalFocus } from '@/hooks/use-modal-focus';
import { getAdjacentId } from '@/lib/circular-navigation';
import { getLocalStorage } from '@/lib/safe-storage';
import { useArcadeSounds } from '../audio/use-arcade-sounds';
import { useSoundPlayer } from '../audio/use-sound-player';
import { CARTRIDGE_IDS, getBestMode, interpretHomeKey } from '../flow/cartridges';
import type { CartridgeId } from '../flow/cartridges';
import { useArcadeFlow } from '../flow/use-arcade-flow';
import { readRecords, saveRunResult } from '../results/records';
import type { RunResult } from '../results/run-result';
import { BootScreen } from '../screens/BootScreen';
import { GameScreen } from '../screens/GameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SoundToggle } from '../ui/SoundToggle';

type ArcadeExperienceProps = {
  onExit: () => void;
  getFallbackFocus?: () => HTMLElement | null;
};

const SOUND_KEY = 'm';

const KEYS_THAT_DO_NOT_SKIP_THE_BOOT = new Set([
  'Tab',
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'Escape',
]);

function readAllRecords() {
  const storage = getLocalStorage();
  return { standard: readRecords(storage, 'standard'), hotfix: readRecords(storage, 'hotfix') };
}

export function ArcadeExperience({ onExit, getFallbackFocus }: ArcadeExperienceProps) {
  const arcadeRef = useRef<HTMLDivElement>(null);
  const cartridgeRefs = useRef<Partial<Record<CartridgeId, HTMLButtonElement | null>>>({});
  const [records, setRecords] = useState(readAllRecords);
  const isRootUnlocked = records.standard.isRootUnlocked;
  const arcade = useArcadeFlow({ isRootUnlocked });
  const { flow } = arcade;
  const sound = useSoundPlayer();
  useArcadeSounds({
    screen: flow.screen,
    selectedId: flow.selectedId,
    rejection: flow.rejection,
    visibleLines: arcade.bootProgress.visibleLines,
    play: sound.play,
  });
  const bestScore = records[getBestMode(flow.selectedId, isRootUnlocked)].best;

  const handleEscape = () => {
    if (flow.screen === 'boot') arcade.finishBoot();
    else if (flow.screen === 'home') onExit();
  };

  const handleRunFinished = (result: RunResult) => {
    saveRunResult(getLocalStorage(), result);
    setRecords(readAllRecords());
  };
  useModalFocus({
    isOpen: true,
    containerRef: arcadeRef,
    onEscape: handleEscape,
    getFallbackFocus,
  });

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const isSoundKey = event.key.toLowerCase() === SOUND_KEY;
    if (isSoundKey && flow.screen !== 'game') {
      if (!event.repeat) sound.toggleSound();
      return;
    }
    if (flow.screen === 'boot') {
      if (!KEYS_THAT_DO_NOT_SKIP_THE_BOOT.has(event.key)) arcade.finishBoot();
      return;
    }
    if (flow.screen !== 'home') return;

    const command = interpretHomeKey(event.key);
    if (command === 'previous' || command === 'next') {
      event.preventDefault();
      const nextId = getAdjacentId(CARTRIDGE_IDS, flow.selectedId, command);
      arcade.move(command);
      if (nextId !== null) cartridgeRefs.current[nextId as CartridgeId]?.focus();
    } else if (command === 'insert' && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      arcade.insert(flow.selectedId);
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  return (
    <div
      ref={arcadeRef}
      role="dialog"
      aria-modal="true"
      aria-label={arcadeContent.dialogLabel}
      tabIndex={-1}
      className="fixed inset-0 z-(--z-panel) flex flex-col bg-arcade-screen text-arcade-ink-100 outline-none"
    >
      <header className="flex items-center justify-between px-5 pt-5">
        <Button variant="secondary" onClick={onExit}>
          <span aria-hidden="true" className="text-ember-400">
            ←
          </span>
          {arcadeContent.backLabel}
        </Button>
        <SoundToggle isOn={sound.isSoundOn} onToggle={sound.toggleSound} />
      </header>
      <div className="relative flex-1">
        {flow.screen === 'boot' && <BootScreen progress={arcade.bootProgress} />}
        {flow.screen === 'home' && (
          <HomeScreen
            flow={flow}
            isRootUnlocked={isRootUnlocked}
            bestScore={bestScore}
            cartridgeRefs={cartridgeRefs}
            onSelect={arcade.select}
            onInsert={arcade.insert}
          />
        )}
        {flow.screen === 'game' && flow.mode !== null && (
          <GameScreen
            mode={flow.mode}
            previousBest={records[flow.mode].best}
            onFinish={handleRunFinished}
            onLeave={arcade.leaveGame}
            onToggleSound={sound.toggleSound}
            onSound={sound.play}
          />
        )}
      </div>
    </div>
  );
}
