import { createElement } from 'react';
import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type TextProps = ComponentProps<'p'> & {
  as?: 'p' | 'span' | 'div' | 'li' | 'strong' | 'dd' | 'dt';
  tone?: 'primary' | 'secondary' | 'muted';
  size?: 'body' | 'caption';
};

const toneClasses = {
  primary: 'text-ink-100',
  secondary: 'text-ink-200',
  muted: 'text-ink-300',
} as const;

const sizeClasses = {
  body: 'text-body text-pretty',
  caption: 'text-xs leading-snug',
} as const;

export function Text({ as = 'p', tone = 'primary', size = 'body', className, ...rest }: TextProps) {
  return createElement(as, {
    className: joinClassNames('m-0', toneClasses[tone], sizeClasses[size], className),
    ...rest,
  });
}
