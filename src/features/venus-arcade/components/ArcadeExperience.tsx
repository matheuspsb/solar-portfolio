'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { arcadeContent } from '@/content/arcade';
import { useModalFocus } from '@/hooks/use-modal-focus';
import { getAdjacentId } from '@/lib/circular-navigation';
import { getLocalStorage } from '@/lib/safe-storage';
import { CARTRIDGE_IDS, getBestMode, interpretHomeKey } from '../flow/cartridges';
import type { CartridgeId } from '../flow/cartridges';
import { useArcadeFlow } from '../flow/use-arcade-flow';
import { readRecords } from '../results/records';
import { BootScreen } from '../screens/BootScreen';
import { GamePlaceholder } from '../screens/GamePlaceholder';
import { HomeScreen } from '../screens/HomeScreen';

type ArcadeExperienceProps = {
  onExit: () => void;
  getFallbackFocus?: () => HTMLElement | null;
};

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
  const [records] = useState(readAllRecords);
  const isRootUnlocked = records.standard.isRootUnlocked;
  const arcade = useArcadeFlow({ isRootUnlocked });
  const { flow } = arcade;
  const bestScore = records[getBestMode(flow.selectedId, isRootUnlocked)].best;

  const handleEscape = () => {
    if (flow.screen === 'boot') arcade.finishBoot();
    else if (flow.screen === 'game') arcade.leaveGame();
    else onExit();
  };
  useModalFocus({
    isOpen: true,
    containerRef: arcadeRef,
    onEscape: handleEscape,
    getFallbackFocus,
  });

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
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
      <header className="flex px-5 pt-5">
        <Button variant="secondary" onClick={onExit}>
          <span aria-hidden="true" className="text-ember-400">
            ←
          </span>
          {arcadeContent.backLabel}
        </Button>
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
        {flow.screen === 'game' && <GamePlaceholder onLeave={arcade.leaveGame} />}
      </div>
    </div>
  );
}
