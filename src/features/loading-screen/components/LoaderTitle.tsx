import { loaderContent } from '@/content/loader';
import type { TitleMarks } from '../lib/title-marks';

const SETTLED_SPACING_EM = 0.42;

type LoaderTitleProps = {
  title: TitleMarks;
  opacity: number;
};

export function LoaderTitle({ title, opacity }: LoaderTitleProps) {
  return (
    <div
      className="absolute inset-x-0 top-[73%] flex flex-col items-center gap-3"
      style={{ opacity }}
    >
      <div className="text-loader-title font-bold tracking-loader-title text-ink-100">
        {title.letters.map((letter, index) => (
          <span
            key={index}
            className="inline-block"
            style={{
              opacity: letter.opacity,
              transform: `translateY(${letter.offsetY}px)`,
              filter: `blur(${letter.blur}px)`,
            }}
          >
            {letter.character}
          </span>
        ))}
      </div>
      <div
        className="font-mono text-loader-subtitle text-ember-400"
        style={{
          opacity: title.subtitleOpacity,
          letterSpacing: `${title.subtitleSpacingEm}em`,
          paddingLeft: `${SETTLED_SPACING_EM}em`,
        }}
      >
        {loaderContent.subtitle}
      </div>
    </div>
  );
}
