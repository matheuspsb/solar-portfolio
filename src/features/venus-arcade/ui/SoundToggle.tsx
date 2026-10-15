import { arcadeContent } from '@/content/arcade';
import { joinClassNames } from '@/lib/join-class-names';

type SoundToggleProps = { isOn: boolean; onToggle: () => void };

export function SoundToggle({ isOn, onToggle }: SoundToggleProps) {
  const label = isOn ? arcadeContent.sound.on : arcadeContent.sound.off;
  const tone = isOn
    ? 'border-ember-400 text-ember-400'
    : 'border-arcade-outline text-arcade-ink-300';

  return (
    <button
      type="button"
      aria-pressed={isOn}
      aria-label={arcadeContent.a11y.soundToggle}
      onClick={onToggle}
      className={joinClassNames(
        'inline-flex min-h-(--size-touch-target) min-w-(--size-touch-target) cursor-pointer items-center justify-center gap-2 rounded-full border bg-arcade-cabinet-low px-3 font-mono text-label tracking-caps transition-colors duration-fast ease-standard hover:border-ember-400',
        tone,
      )}
    >
      <span aria-hidden="true" className="text-base">
        ♪
      </span>
      <span aria-hidden="true" className="hidden sm:inline">
        {label}
      </span>
    </button>
  );
}
