import type { ReactNode } from 'react';
import { arcadeContent } from '@/content/arcade';
import type { HudSnapshot } from '../hud/hud-snapshot';
import type { SessionCommand } from '../session/keyboard';
import { ArcadeButton } from '../ui/ArcadeButton';
import { Kicker } from '../ui/Kicker';
import { PixelTitle } from '../ui/PixelTitle';

const { game } = arcadeContent;

type GameOverlayProps = {
  hud: HudSnapshot;
  onCommand: (command: SessionCommand) => void;
};

function OverlayFrame({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-arcade-screen/70 p-6 text-center">
      {children}
    </div>
  );
}

export function GameOverlay({ hud, onCommand }: GameOverlayProps) {
  if (hud.phase === 'title') {
    return (
      <OverlayFrame>
        <Kicker>{game.title.kicker}</Kicker>
        <PixelTitle>{arcadeContent.cartridges[0].name}</PixelTitle>
        <p className="font-mono text-arcade-hint tracking-caps text-arcade-ink-300">
          {game.title.controls}
        </p>
        <ArcadeButton onClick={() => onCommand('begin')}>{game.title.start}</ArcadeButton>
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
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <PixelTitle tone={hud.end === 'crash' ? 'alert' : 'root'}>
          {game.banners[hud.end]}
        </PixelTitle>
      </div>
    );
  }

  // TODO(venus-arcade-step-11): replace this minimal pause notice with the designed pause screen.
  if (hud.phase === 'paused') {
    return (
      <OverlayFrame>
        <PixelTitle>{game.paused.title}</PixelTitle>
        <ArcadeButton onClick={() => onCommand('resume')}>{game.paused.resume}</ArcadeButton>
        <ArcadeButton variant="secondary" onClick={() => onCommand('quit')}>
          {game.paused.quit}
        </ArcadeButton>
      </OverlayFrame>
    );
  }

  // TODO(venus-arcade-step-12): replace this minimal summary with the results screen.
  if (hud.phase === 'finished') {
    return (
      <OverlayFrame>
        <PixelTitle>{game.finished.title}</PixelTitle>
        <p className="font-pixel text-arcade-detail-title text-venus-phosphor tabular-nums">
          {hud.scoreText}
        </p>
        <ArcadeButton onClick={() => onCommand('restart')}>{game.finished.restart}</ArcadeButton>
        <ArcadeButton variant="secondary" onClick={() => onCommand('quit')}>
          {game.finished.quit}
        </ArcadeButton>
      </OverlayFrame>
    );
  }

  return null;
}
