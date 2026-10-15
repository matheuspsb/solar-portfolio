import { useEffect, useEffectEvent, useRef } from 'react';
import { arcadeContent } from '@/content/arcade';
import { formatClock } from '../hud/format-clock';
import type { SessionCommand } from '../session/keyboard';
import { ArcadeButton } from '../ui/ArcadeButton';
import { Kicker } from '../ui/Kicker';
import { PixelTitle } from '../ui/PixelTitle';

const { paused } = arcadeContent.game;

type PauseScreenProps = {
  secondsLeft: number;
  controlsText: string;
  onCommand: (command: SessionCommand) => void;
};

export function PauseScreen({ secondsLeft, controlsText, onCommand }: PauseScreenProps) {
  const resumeRef = useRef<HTMLButtonElement>(null);
  const focusResume = useEffectEvent(() => resumeRef.current?.focus());

  useEffect(() => {
    const origin = document.activeElement;
    focusResume();
    return () => {
      if (origin instanceof HTMLElement && origin.isConnected) origin.focus();
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-auto bg-arcade-screen/90 p-6 text-center">
      <PixelTitle>{paused.title}</PixelTitle>
      <Kicker>
        {paused.onHold} · {formatClock(secondsLeft)} {paused.left}
      </Kicker>
      <div className="flex w-full max-w-70 flex-col gap-2.5">
        <ArcadeButton ref={resumeRef} onClick={() => onCommand('resume')}>
          {paused.resume}
        </ArcadeButton>
        <ArcadeButton variant="secondary" onClick={() => onCommand('restart')}>
          {paused.restart}
        </ArcadeButton>
        <ArcadeButton variant="secondary" onClick={() => onCommand('quit')}>
          {paused.quit}
        </ArcadeButton>
      </div>
      <p className="max-w-sm font-mono text-arcade-hint text-arcade-ink-300">{controlsText}</p>
    </div>
  );
}
