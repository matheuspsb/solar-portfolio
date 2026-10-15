import { arcadeContent } from '@/content/arcade';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { FireMode } from '../engine/shots';
import { useGameSession } from '../game/use-game-session';
import { GameHud } from '../hud/GameHud';
import type { RunResult } from '../results/run-result';
import { GameOverlay } from './GameOverlay';

type GameScreenProps = {
  mode: FireMode;
  previousBest: number;
  onFinish: (result: RunResult) => void;
  onLeave: () => void;
};

export function GameScreen({ mode, previousBest, onFinish, onLeave }: GameScreenProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { stageRef, canvasRef, hud, sendCommand } = useGameSession({
    mode,
    previousBest,
    reducedMotion,
    onFinish,
    onQuit: onLeave,
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
          <GameHud hud={hud} />
          <GameOverlay hud={hud} onCommand={sendCommand} />
          <VisuallyHidden as="div" role="status">
            {arcadeContent.a11y.phaseAnnouncements[hud.phase]}
          </VisuallyHidden>
        </>
      )}
    </div>
  );
}
