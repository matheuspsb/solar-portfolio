import { useEffect, useEffectEvent, useRef } from 'react';
import { arcadeContent } from '@/content/arcade';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import { getResultsView } from '../results/results-view';
import type { RunResult } from '../results/run-result';
import type { SessionCommand } from '../session/keyboard';
import { ArcadeButton } from '../ui/ArcadeButton';
import { StatusChip } from '../ui/StatusChip';

const { results } = arcadeContent.game;
const { a11y } = arcadeContent;

type ResultsScreenProps = {
  result: RunResult;
  onCommand: (command: SessionCommand) => void;
};

export function ResultsScreen({ result, onCommand }: ResultsScreenProps) {
  const restartRef = useRef<HTMLButtonElement>(null);
  const focusRestart = useEffectEvent(() => restartRef.current?.focus());
  useEffect(() => {
    focusRestart();
  }, []);

  const view = getResultsView(result);
  const kickerTone = view.end === 'crash' ? 'text-venus-alert' : 'text-ember-400';
  const rankTone = view.reachedRoot ? 'text-venus-root' : 'text-venus-phosphor';

  return (
    <div className="@container absolute inset-0 overflow-auto bg-arcade-screen/90 p-[clamp(1.25rem,4cqw,2.75rem)_clamp(0.875rem,4cqw,2.5rem)]">
      <div className="mx-auto flex min-h-full w-full max-w-160 flex-col items-center justify-center gap-[clamp(0.75rem,2cqw,1.25rem)] text-center">
        <VisuallyHidden as="div" role="status">
          {a11y.finalScore} {view.scoreText}. {a11y.finalRank} {view.rank.title}.{' '}
          {view.isNewBest ? a11y.newBestAnnouncement : ''}
        </VisuallyHidden>
        <p
          className={`font-mono text-arcade-kicker tracking-caps motion-safe:animate-arcade-rise ${kickerTone}`}
        >
          {results.kickers[view.end]}
        </p>
        <div className="flex flex-col items-center gap-1.5 motion-safe:animate-arcade-rise">
          <p className="font-pixel text-arcade-result-score leading-[0.9] text-arcade-ink-100 text-shadow-pixel-glow tabular-nums">
            {view.scoreText}
          </p>
          {view.isNewBest && (
            <StatusChip tone="root" className="motion-safe:animate-arcade-pop">
              {results.newBest}
            </StatusChip>
          )}
        </div>
        <div className="flex flex-col gap-1 motion-safe:animate-arcade-rise">
          <p className="font-mono text-arcade-hint tracking-caps text-arcade-ink-300">
            {results.rank}
          </p>
          <p className={`font-pixel text-arcade-rank ${rankTone}`}>{view.rank.title}</p>
          <p className="text-arcade-detail text-arcade-ink-200">{view.rank.line}</p>
        </div>
        <dl className="grid w-full grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-px overflow-hidden rounded-sm border border-arcade-grid bg-arcade-grid motion-safe:animate-arcade-rise">
          {view.stats.map((stat) => (
            <div key={stat.key} className="flex flex-col gap-1 bg-arcade-cabinet-low p-3 text-left">
              <dt className="font-mono text-arcade-hint tracking-caps text-arcade-ink-300">
                {results.stats[stat.key]}
              </dt>
              <dd className="font-pixel text-arcade-stat text-arcade-ink-100">{stat.value}</dd>
            </div>
          ))}
        </dl>
        {view.showsRootHint && (
          <p className="font-mono text-arcade-hint tracking-caps text-venus-copper">
            {results.rootHint}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 motion-safe:animate-arcade-rise">
          <ArcadeButton ref={restartRef} onClick={() => onCommand('restart')}>
            {results.restart}
          </ArcadeButton>
          <ArcadeButton variant="secondary" onClick={() => onCommand('quit')}>
            {results.quit}
          </ArcadeButton>
        </div>
        <p className="font-mono text-arcade-hint tracking-caps text-arcade-ink-300">
          {results.best} · {view.bestText}
        </p>
      </div>
    </div>
  );
}
