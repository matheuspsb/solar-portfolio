import type { ReactNode } from 'react';
import { arcadeContent } from '@/content/arcade';
import type { HudSnapshot } from '../hud/hud-snapshot';
import type { SessionCommand } from '../session/keyboard';
import { ArcadeButton } from '../ui/ArcadeButton';
import { Kicker } from '../ui/Kicker';
import { PixelTitle } from '../ui/PixelTitle';
import { EndBanner } from './EndBanner';
import { PauseScreen } from './PauseScreen';
import { ResultsScreen } from './ResultsScreen';

const { game } = arcadeContent;

type GameOverlayProps = {
  hud: HudSnapshot;
  isTouch: boolean;
  onCommand: (command: SessionCommand) => void;
};

function OverlayFrame({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-arcade-screen/70 p-6 text-center">
      {children}
    </div>
  );
}

export function GameOverlay({ hud, isTouch, onCommand }: GameOverlayProps) {
  const controlsText = isTouch ? game.title.touchControls : game.title.controls;
  const startLabel = isTouch ? game.title.touchStart : game.title.start;
  if (hud.phase === 'title') {
    return (
      <OverlayFrame>
        <Kicker>{game.title.kicker}</Kicker>
        <PixelTitle>{arcadeContent.cartridges[0].name}</PixelTitle>
        <p className="font-mono text-arcade-hint tracking-caps text-arcade-ink-300">
          {controlsText}
        </p>
        <ArcadeButton onClick={() => onCommand('begin')}>{startLabel}</ArcadeButton>
        <ArcadeButton variant="secondary" onClick={() => onCommand('quit')}>
          {game.leaveLabel}
        </ArcadeButton>
      </OverlayFrame>
    );
  }

  if (hud.phase === 'countdown' && hud.countdownLabel !== null) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-pixel text-arcade-countdown text-venus-phosphor text-shadow-pixel-glow"
      >
        {hud.countdownLabel}
      </div>
    );
  }

  if (hud.phase === 'ending' && hud.end !== null) {
    return <EndBanner end={hud.end} />;
  }

  if (hud.phase === 'paused') {
    return (
      <PauseScreen
        secondsLeft={hud.secondsLeft}
        controlsText={controlsText}
        onCommand={onCommand}
      />
    );
  }

  if (hud.phase === 'finished' && hud.result !== null) {
    return <ResultsScreen result={hud.result} onCommand={onCommand} />;
  }

  return null;
}
