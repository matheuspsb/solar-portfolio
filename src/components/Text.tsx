import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type TextProps = ComponentProps<'p'> & {
  tone?: 'secondary' | 'muted';
  size?: 'body' | 'caption';
};

const toneClasses = {
  secondary: 'text-ink-200',
  muted: 'text-ink-300',
} as const;

const sizeClasses = {
  body: 'text-body text-pretty',
  caption: 'text-xs leading-snug',
} as const;

export function Text({ tone = 'secondary', size = 'body', className, ...rest }: TextProps) {
  return (
    <p
      className={joinClassNames('m-0', toneClasses[tone], sizeClasses[size], className)}
      {...rest}
    />
  );
}
