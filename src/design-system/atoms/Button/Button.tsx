import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

const baseClasses =
  'inline-flex min-h-(--size-touch-target) cursor-pointer items-center justify-center gap-2 rounded-pill border border-transparent px-5 py-2 font-semibold transition-colors duration-fast ease-standard disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses = {
  primary: 'bg-sun-400 text-on-accent hover:enabled:bg-sun-300',
  secondary:
    'border-border bg-transparent text-text-primary hover:enabled:border-border-strong hover:enabled:bg-surface-hover',
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
