import { createElement } from 'react';
import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type TextProps = ComponentProps<'p'> & {
  as?: 'p' | 'span' | 'div' | 'li' | 'strong' | 'dd' | 'dt';
  tone?: 'primary' | 'secondary';
};

const toneClasses = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
} as const;

export function Text({ as = 'p', tone = 'primary', className, ...rest }: TextProps) {
  return createElement(as, {
    className: joinClassNames('m-0 text-base', toneClasses[tone], className),
    ...rest,
  });
}
