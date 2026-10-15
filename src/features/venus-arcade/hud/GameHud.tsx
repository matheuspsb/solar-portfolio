import { arcadeContent } from '@/content/arcade';
import { arcadeTokens } from '@/styles/arcade-tokens';
import { STARTING_INTEGRITY } from '../engine/constants';
import { PixelSprite } from '../ui/PixelSprite';
import { StatusChip } from '../ui/StatusChip';
import type { HudSnapshot } from './hud-snapshot';

const { hud: hudLabels } = arcadeContent.game;
const { a11y } = arcadeContent;

const INTEGRITY_SLOTS = [...Array(STARTING_INTEGRITY).keys()];
const INTEGRITY_ICON_SCALE = 2;
const PERCENT = 100;

type GameHudProps = { hud: HudSnapshot };

export function GameHud({ hud }: GameHudProps) {
  const barWidth = `${hud.timeRatio * PERCENT}%`;
  const barTone = hud.isUrgent ? 'bg-venus-alert' : 'bg-ember-400';
  const timeTone = hud.isUrgent ? 'text-venus-alert' : 'text-arcade-ink-100';

  return (
    <div
      role="group"
      aria-label={a11y.hudGroup}
      className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-[clamp(0.75rem,2.4cqw,1.5rem)] font-pixel text-arcade-hud"
    >
      <div className="flex flex-col gap-1">
        <span className="text-arcade-ink-300">{hudLabels.score}</span>
        <span className="text-venus-phosphor tabular-nums">{hud.scoreText}</span>
        {hud.showsMultiplier && <StatusChip tone="root">x{hud.multiplier}</StatusChip>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
        <span className="text-arcade-ink-300">{hudLabels.time}</span>
        <span className={`${timeTone} tabular-nums`}>{hud.secondsLeft}</span>
        <div className="h-1.5 w-full max-w-60 bg-arcade-grid">
          <div className={`h-full ${barTone}`} style={{ width: barWidth }} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-arcade-ink-300">{hudLabels.integrity}</span>
        <span className="flex gap-1.5">
          {INTEGRITY_SLOTS.map((slot) => (
            <span key={slot} className={slot < hud.integrity ? '' : 'opacity-25'}>
              <PixelSprite
                name="drone"
                color={arcadeTokens.droneColor}
                detailColor={arcadeTokens.spriteDetailColor}
                scale={INTEGRITY_ICON_SCALE}
              />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
