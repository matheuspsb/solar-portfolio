import { loaderContent } from '@/content/loader';
import { enter, mix, seg } from './easing';
import { DESIGN_CUES } from './timeline';

export type LetterMark = { character: string; opacity: number; offsetY: number; blur: number };

export type TitleMarks = {
  letters: LetterMark[];
  subtitleOpacity: number;
  subtitleSpacingEm: number;
};

const LETTER_START_SECONDS = 0.55;
const LETTER_DURATION_SECONDS = 0.7;
const LETTER_STAGGER_SECONDS = 0.07;
const LETTER_RISE_PIXELS = 46;
const LETTER_BLUR_PIXELS = 14;
const SUBTITLE_START_SECONDS = 1.2;
const SUBTITLE_END_SECONDS = 2.1;
const SUBTITLE_WIDE_SPACING_EM = 0.9;
const SUBTITLE_SETTLED_SPACING_EM = 0.42;

export function getTitleMarks(designSeconds: number): TitleMarks {
  const { orbits } = DESIGN_CUES;
  const letters = loaderContent.title.split('').map((character, index) => {
    const start = orbits + LETTER_START_SECONDS + index * LETTER_STAGGER_SECONDS;
    const progress = enter(seg(designSeconds, start, start + LETTER_DURATION_SECONDS));
    return {
      character,
      opacity: progress,
      offsetY: (1 - progress) * LETTER_RISE_PIXELS,
      blur: (1 - progress) * LETTER_BLUR_PIXELS,
    };
  });
  const subtitleProgress = enter(
    seg(designSeconds, orbits + SUBTITLE_START_SECONDS, orbits + SUBTITLE_END_SECONDS),
  );
  return {
    letters,
    subtitleOpacity: subtitleProgress,
    subtitleSpacingEm: mix(SUBTITLE_WIDE_SPACING_EM, SUBTITLE_SETTLED_SPACING_EM, subtitleProgress),
  };
}
