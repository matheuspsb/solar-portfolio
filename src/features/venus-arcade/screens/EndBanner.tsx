import { arcadeContent } from '@/content/arcade';
import type { RunEnd } from '../results/run-result';

const { banners } = arcadeContent.game;

type EndBannerProps = { end: RunEnd };

export function EndBanner({ end }: EndBannerProps) {
  const isCrash = end === 'crash';
  const washTone = isCrash ? 'bg-arcade-crash-wash/80' : 'bg-arcade-screen/70';
  const titleTone = isCrash
    ? 'text-venus-alert motion-safe:animate-arcade-crash'
    : 'text-ember-400 motion-safe:animate-arcade-pop';

  return (
    <div
      className={`@container pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center ${washTone}`}
    >
      <p
        className={`font-pixel text-arcade-end-title leading-none text-shadow-pixel-glow ${titleTone}`}
      >
        {banners[end].title}
      </p>
      <p className="font-mono text-arcade-hint tracking-caps text-arcade-ink-200">
        {banners[end].subtitle}
      </p>
    </div>
  );
}
