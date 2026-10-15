import { arcadeContent } from '@/content/arcade';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import { useMediaQuery } from '@/hooks/use-media-query';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { SoundName } from '../audio/sound-specs';
import type { FireMode } from '../engine/shots';
import { useGameSession } from '../game/use-game-session';
import { GameHud } from '../hud/GameHud';
import type { RunResult } from '../results/run-result';
import { GameOverlay } from './GameOverlay';

const COARSE_POINTER_QUERY = '(pointer: coarse)';

type GameScreenProps = {
  mode: FireMode;
  previousBest: number;
  onFinish: (result: RunResult) => void;
  onLeave: () => void;
  onToggleSound: () => void;
  onSound: (name: SoundName) => void;
};

export function GameScreen({
  mode,
  previousBest,
  onFinish,
  onLeave,
  onToggleSound,
  onSound,
}: GameScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useMediaQuery(COARSE_POINTER_QUERY);
  const { stageRef, canvasRef, hud, sendCommand } = useGameSession({
    mode,
    previousBest,
    reducedMotion,
    onFinish,
    onQuit: onLeave,
    onToggleSound,
    onSound,
  });

  return (
    <div ref={stageRef} className="@container absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={arcadeContent.a11y.gameCanvas}
        className="block size-full touch-none font-pixel [image-rendering:pixelated]"
      />
      {hud !== null && (
        <>
          <GameHud hud={hud} onPause={() => sendCommand('pause')} />
          <GameOverlay hud={hud} isTouch={isTouch} onCommand={sendCommand} />
          <VisuallyHidden as="div" role="status">
            {arcadeContent.a11y.phaseAnnouncements[hud.phase]}
          </VisuallyHidden>
        </>
      )}
    </div>
  );
}
