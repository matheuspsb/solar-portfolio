import { getRingOffset } from './answer-progress';

const RING_CENTER = 12;
const RING_RADIUS = 9;
const RING_MARKER_Y = 3;

type AnswerFooterProps = {
  noteId: string;
  note: string;
  hasError: boolean;
  count?: { current: number; max: number };
};

export function AnswerFooter({ noteId, note, hasError, count }: AnswerFooterProps) {
  return (
    <div className="flex min-h-6.5 items-center justify-between gap-3">
      {hasError ? (
        <p id={noteId} role="alert" className="m-0 text-tag text-danger-400">
          {note}
        </p>
      ) : (
        <p id={noteId} className="m-0 text-tag text-ink-400">
          {note}
        </p>
      )}
      {count && (
        <div className="flex items-center gap-2 font-mono text-label text-ink-300">
          <span>
            {count.current}/{count.max}
          </span>
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              strokeWidth={2}
              className="fill-none stroke-line"
            />
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              strokeWidth={2}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100 100"
              strokeDashoffset={getRingOffset({ count: count.current, max: count.max })}
              className="fill-none stroke-ember-400 transition-[stroke-dashoffset] duration-base"
            />
            <circle cx={RING_CENTER} cy={RING_MARKER_Y} r={2} className="fill-nebula-300" />
          </svg>
        </div>
      )}
    </div>
  );
}
