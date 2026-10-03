import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = ComponentProps<'h1'> & {
  level: HeadingLevel;
  size?: 'md' | 'lg' | 'xl' | '2xl';
};

const baseClasses = 'm-0 font-bold leading-tight text-text-primary';

const sizeClasses = {
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
} as const;

export function Heading({ level, size = 'lg', className, ...rest }: HeadingProps) {
  const Element = `h${level}` as const;
  return (
    <Element className={joinClassNames(baseClasses, sizeClasses[size], className)} {...rest} />
  );
}
