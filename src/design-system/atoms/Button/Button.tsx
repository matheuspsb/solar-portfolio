import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'floating';
};

const baseClasses =
  'inline-flex min-h-(--size-touch-target) cursor-pointer items-center justify-center gap-2 rounded-pill border px-5 py-2 font-semibold transition-colors duration-fast ease-standard disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses = {
  primary: 'border-transparent bg-ember-400 text-on-ember hover:enabled:bg-ember-200',
  secondary:
    'border-line-control bg-transparent text-ink-100 hover:enabled:border-ember-400 hover:enabled:bg-surface-hover',
  floating:
    'border-line-control bg-surface text-ink-100 backdrop-blur-sm hover:enabled:border-ember-400 hover:enabled:bg-surface-hover',
} as const;

export function Button({ variant = 'primary', type = 'button', className, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(baseClasses, variantClasses[variant], className)}
      {...rest}
    />
  );
}
