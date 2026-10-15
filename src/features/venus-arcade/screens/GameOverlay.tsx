import { arcadeContent } from '@/content/arcade';
import { arcadeTokens } from '@/styles/arcade-tokens';
import type { FireMode } from '../engine/shots';
import type { HudSnapshot } from '../hud/hud-snapshot';
import type { SessionCommand } from '../session/keyboard';
import { ArcadeButton } from '../ui/ArcadeButton';
import { Kicker } from '../ui/Kicker';
import { PixelSprite } from '../ui/PixelSprite';
import { PixelTitle } from '../ui/PixelTitle';
import { EndBanner } from './EndBanner';
import { PauseScreen } from './PauseScreen';
import { ResultsScreen } from './ResultsScreen';

const { game } = arcadeContent;

const LEGEND_SPRITE_SCALE = 3;
const LEGEND_COLORS = {
  crawler: arcadeTokens.crawlerColor,
  data: arcadeTokens.dataColor,
  glitch: arcadeTokens.glitchColor,
  patch: arcadeTokens.droneColor,
} as const;

type GameOverlayProps = {
  hud: HudSnapshot;
  mode: FireMode;
  isTouch: boolean;
  onCommand: (command: SessionCommand) => void;
};

export function GameOverlay({ hud, mode, isTouch, onCommand }: GameOverlayProps) {
  const controlsText = isTouch ? game.title.touchControls : game.title.controls;
  const startLabel = isTouch ? game.title.touchStart : game.title.start;
  if (hud.phase === 'title') {
    return (
      <div className="@container absolute inset-0 flex flex-col items-center justify-center gap-[clamp(0.75rem,2.2cqw,1.375rem)] overflow-auto bg-arcade-screen/85 p-6 text-center">
        <Kicker className="text-venus-copper">
          {mode === 'hotfix' ? game.title.hotfixKicker : game.title.kicker}
        </Kicker>
        <div className="flex flex-col items-center gap-2">
          <PixelTitle tone={mode === 'hotfix' ? 'root' : 'phosphor'}>
            {arcadeContent.cartridges[0].name}
          </PixelTitle>
          <p className="font-pixel text-arcade-detail tracking-[0.06em] text-venus-alert">
            {game.title.subtitle}
          </p>
        </div>
        <ul className="grid w-[min(720px,100%)] grid-cols-[repeat(auto-fit,minmax(8.125rem,1fr))] gap-px overflow-hidden rounded-sm border border-arcade-grid bg-arcade-grid">
          {game.title.legend.map((entry) => (
            <li
              key={entry.verb}
              className="flex flex-col items-center gap-2 bg-arcade-cabinet-low px-2.5 py-3.5"
            >
              <PixelSprite
                name={entry.sprite}
                color={LEGEND_COLORS[entry.sprite]}
                detailColor={arcadeTokens.spriteDetailColor}
                scale={LEGEND_SPRITE_SCALE}
              />
              <span className="font-pixel text-arcade-hint text-arcade-ink-100">{entry.verb}</span>
              <span className="text-arcade-hint text-arcade-ink-200">{entry.text}</span>
            </li>
          ))}
        </ul>
        <p className="max-w-lg font-mono text-arcade-hint tracking-caps text-arcade-ink-300">
          {controlsText}
        </p>
        <ArcadeButton onClick={() => onCommand('begin')}>{startLabel}</ArcadeButton>
        <ArcadeButton variant="secondary" onClick={() => onCommand('quit')}>
          {game.leaveLabel}
        </ArcadeButton>
      </div>
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
