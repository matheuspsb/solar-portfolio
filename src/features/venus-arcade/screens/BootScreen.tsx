import { arcadeContent } from '@/content/arcade';
import { VisuallyHidden } from '@/components/VisuallyHidden';
import type { BootProgress } from '../flow/boot-timeline';

type BootScreenProps = { progress: BootProgress };

const { boot, a11y } = arcadeContent;

export function BootScreen({ progress }: BootScreenProps) {
  const lines = boot.lines.slice(0, progress.visibleLines);

  return (
    <div className="@container absolute inset-0 motion-safe:animate-arcade-crt-on">
      <VisuallyHidden role="status">{a11y.bootSkip}</VisuallyHidden>
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col justify-center gap-1.5 p-[clamp(1.25rem,5cqw,3.5rem)] font-mono text-arcade-boot text-venus-phosphor"
      >
        {lines.map((line) => (
          <div
            key={line}
            className="overflow-hidden text-ellipsis whitespace-pre motion-safe:animate-arcade-rise"
          >
            {line}
          </div>
        ))}
        {progress.isTitleVisible && (
          <div className="mt-4.5 font-pixel text-arcade-boot-title leading-[1.1] text-venus-phosphor text-shadow-pixel-glow motion-safe:animate-arcade-pop">
            {boot.title}
            <span className="motion-safe:animate-arcade-blink">_</span>
          </div>
        )}
        <div className="absolute right-5.5 bottom-4.5 text-label tracking-caps text-arcade-ink-300">
          {boot.skipHint}
        </div>
      </div>
    </div>
  );
}
