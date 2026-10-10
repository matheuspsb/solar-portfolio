import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = ComponentProps<'h1'> & {
  level: HeadingLevel;
  size?: 'xl' | 'display' | 'question';
};

const baseClasses = 'm-0 font-bold leading-tight text-ink-100';

const sizeClasses = {
  xl: 'text-xl',
  display: 'text-display tracking-name',
  question: 'text-question tracking-name',
} as const;

export function Heading({ level, size = 'xl', className, ...rest }: HeadingProps) {
  const Element = `h${level}` as const;
  return (
    <Element className={joinClassNames(baseClasses, sizeClasses[size], className)} {...rest} />
  );
}
