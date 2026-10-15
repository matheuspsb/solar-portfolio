import { arcadeContent } from '@/content/arcade';

const { keyLegend } = arcadeContent;

export function KeyLegend() {
  return (
    <ul
      aria-label={arcadeContent.a11y.keyLegend}
      className="hidden flex-wrap justify-center gap-x-5.5 gap-y-2 font-mono text-arcade-legend tracking-[0.08em] text-arcade-ink-300 min-[720px]:flex"
    >
      {keyLegend.map((entry) => (
        <li key={entry.key} className="flex items-center gap-2">
          <kbd className="rounded-xs border border-b-2 border-arcade-key-border px-1.5 py-0.5 font-mono text-arcade-ink-100">
            {entry.key}
          </kbd>
          <span>{entry.action}</span>
        </li>
      ))}
    </ul>
  );
}
