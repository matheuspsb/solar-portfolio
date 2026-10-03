import type { ComponentProps, ElementType } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type TextProps = ComponentProps<'p'> & {
  as?: ElementType;
  tone?: 'primary' | 'secondary';
};

const toneClasses = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
} as const;

export function Text({ as: Element = 'p', tone = 'primary', className, ...rest }: TextProps) {
  return (
    <Element className={joinClassNames('m-0 text-base', toneClasses[tone], className)} {...rest} />
  );
}
