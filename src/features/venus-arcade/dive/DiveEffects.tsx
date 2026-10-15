import { useEffect, useRef } from 'react';
import { browserFrameScheduler } from '@/hooks/frame-scheduler';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { advanceStreaks, createStreaks, getStreakSegment } from './streaks';
import type { Streak } from './streaks';

export type DivePhase = 'idle' | 'diving' | 'open' | 'surfacing';

type DiveEffectsProps = {
  phase: DivePhase;
  reducedMotion: boolean;
  scheduler?: FrameScheduler;
};

const STREAK_COUNT = 180;
const MILLISECONDS_PER_SECOND = 1000;

const fogMotion: Record<Exclude<DivePhase, 'idle'>, string> = {
  diving: 'animate-arcade-fog-in',
  open: 'opacity-100',
  surfacing: 'animate-arcade-fog-out',
};

function StreakCanvas({ scheduler }: { scheduler: FrameScheduler }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const maxRadius = Math.hypot(canvas.width, canvas.height);
    let streaks: Streak[] = createStreaks({
      count: STREAK_COUNT,
      random: Math.random,
      isInitial: true,
    });
    const startMs = scheduler.now();
    let lastMs = startMs;
    let handle = 0;

    const tick = (nowMs: number) => {
      const deltaSeconds = (nowMs - lastMs) / MILLISECONDS_PER_SECOND;
      const elapsedSeconds = (nowMs - startMs) / MILLISECONDS_PER_SECOND;
      lastMs = nowMs;
      streaks = advanceStreaks({
        streaks,
        deltaSeconds,
        elapsedSeconds,
        maxRadius,
        random: Math.random,
      });
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (const streak of streaks) {
        const segment = getStreakSegment(streak, {
          centerX: canvas.width / 2,
          centerY: canvas.height / 2,
          elapsedSeconds,
        });
        context.globalAlpha = segment.alpha;
        context.strokeStyle = segment.color;
        context.lineWidth = segment.width;
        context.beginPath();
        context.moveTo(segment.startX, segment.startY);
        context.lineTo(segment.endX, segment.endY);
        context.stroke();
      }
      handle = scheduler.request(tick);
    };

    handle = scheduler.request(tick);
    return () => scheduler.cancel(handle);
  }, [scheduler]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" />;
}

export function DiveEffects({
  phase,
  reducedMotion,
  scheduler = browserFrameScheduler,
}: DiveEffectsProps) {
  if (phase === 'idle' || reducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-(--z-panel)">
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-venus-phosphor)_0%,var(--color-planet-copper)_22%,var(--color-venus-fog-edge)_58%,var(--color-venus-fog-deep)_100%)] ${fogMotion[phase]}`}
      />
      {phase === 'diving' && <StreakCanvas scheduler={scheduler} />}
    </div>
  );
}
