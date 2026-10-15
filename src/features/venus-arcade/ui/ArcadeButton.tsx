import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type ArcadeButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

const baseClasses =
  'inline-flex min-h-(--size-touch-target) cursor-pointer items-center justify-center gap-2 rounded-xs border px-6 font-pixel text-sm transition-colors duration-fast ease-standard disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses = {
  primary: 'min-h-12 border-transparent bg-ember-400 text-on-ember hover:enabled:bg-venus-phosphor',
  secondary:
    'border-arcade-outline bg-transparent text-arcade-ink-100 hover:enabled:border-ember-400',
} as const;

export function ArcadeButton({
  variant = 'primary',
  type = 'button',
  className,
  ...rest
}: ArcadeButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(baseClasses, variantClasses[variant], className)}
      {...rest}
    />
  );
}
