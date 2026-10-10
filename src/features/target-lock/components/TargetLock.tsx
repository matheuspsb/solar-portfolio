import type { CSSProperties } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useViewportSize } from '@/hooks/use-viewport-size';
import type { FrameChannel } from '@/lib/screen-frame';
import { useDecodedText } from '../hooks/use-decoded-text';
import { useIntentTarget } from '../hooks/use-intent-target';
import { useScreenFrame } from '../hooks/use-screen-frame';
import { getTelemetryLayout } from '../lib/telemetry-layout';
import type { LockTarget } from '../types';
import { LockFrame } from './LockFrame';
import { TargetCard } from './TargetCard';
import { TelemetryLine } from './TelemetryLine';

type TargetLockProps = {
  targets: readonly LockTarget[];
  activeId: string | null;
  channel: FrameChannel;
};

type AccentStyle = CSSProperties & { '--lock-accent': string };

export function TargetLock({ targets, activeId, channel }: TargetLockProps) {
  const shownId = useIntentTarget(activeId);
  const frame = useScreenFrame(channel);
  const viewport = useViewportSize();
  const reducedMotion = usePrefersReducedMotion();
  const target = targets.find((candidate) => candidate.id === shownId);
  const decodedName = useDecodedText(target?.name ?? '', { isEnabled: !reducedMotion });
  const layout =
    target && frame ? getTelemetryLayout({ frame, anchor: target.anchor, viewport }) : null;

  if (!target || !frame || !layout) return null;

  const accentStyle: AccentStyle = { '--lock-accent': `var(--color-planet-${target.tone})` };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-(--z-chrome)"
      style={accentStyle}
    >
      <div key={target.id} className="contents">
        <LockFrame frame={frame} />
        <TelemetryLine layout={layout} />
        <TargetCard target={target} decodedName={decodedName} card={layout.card} />
      </div>
    </div>
  );
}
