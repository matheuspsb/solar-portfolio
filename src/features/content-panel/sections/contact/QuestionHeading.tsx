import type { CSSProperties } from 'react';
import { Heading } from '@/design-system/atoms/Heading';
import { Label } from '@/design-system/atoms/Label';

const FIRST_WORD_DELAY_SECONDS = 0.08;
const WORD_DELAY_STEP_SECONDS = 0.045;

type QuestionHeadingProps = {
  kicker: string;
  text: string;
};

type AnimationDelayStyle = CSSProperties & { '--animation-delay': string };

function getWordStyle(index: number): AnimationDelayStyle {
  return {
    '--animation-delay': `${FIRST_WORD_DELAY_SECONDS + index * WORD_DELAY_STEP_SECONDS}s`,
  };
}

export function QuestionHeading({ kicker, text }: QuestionHeadingProps) {
  const words = text.split(' ');

  return (
    <div className="flex flex-col gap-2.5">
      <Label as="p" tone="accent" size="eyebrow" className="motion-safe:animate-word-in">
        {kicker}
      </Label>
      <Heading
        level={2}
        size="question"
        aria-label={text}
        className="flex flex-wrap gap-x-[0.26em]"
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            aria-hidden="true"
            className="inline-block motion-safe:animate-word-in"
            style={getWordStyle(index)}
          >
            {word}
          </span>
        ))}
      </Heading>
    </div>
  );
}
