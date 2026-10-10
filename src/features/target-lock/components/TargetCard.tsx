import { joinClassNames } from '@/lib/join-class-names';
import { TARGET_CARD_SIZE } from '../lib/telemetry-layout';
import type { TelemetryLayout } from '../lib/telemetry-layout';
import { targetingCopy } from '@/content/targeting';
import type { LockTarget } from '../types';

type TargetCardProps = {
  target: LockTarget;
  decodedName: string;
  card: TelemetryLayout['card'];
};

const alignmentClasses = {
  left: 'items-start text-left',
  right: 'items-end text-right',
} as const;

export function TargetCard({ target, decodedName, card }: TargetCardProps) {
  return (
    <div
      className={joinClassNames(
        'absolute flex flex-col gap-1 motion-safe:animate-target-card motion-reduce:animate-target-fade',
        alignmentClasses[card.align],
      )}
      style={{ left: card.left, top: card.top, width: TARGET_CARD_SIZE.width }}
    >
      <span className="font-mono text-label tracking-label text-(--lock-accent)">
        {targetingCopy.kickerPrefix} · {target.code}
      </span>
      <span className="font-mono text-target-name font-bold tracking-name text-ink-100">
        {decodedName}
      </span>
      <span className="text-xs text-ink-300">{target.description}</span>
      <span className="mt-1 text-tag text-ink-100">
        {targetingCopy.ctaPrefix}{' '}
        <span className="text-(--lock-accent)">
          {target.ctaLabel} {targetingCopy.ctaArrow}
        </span>
      </span>
    </div>
  );
}
