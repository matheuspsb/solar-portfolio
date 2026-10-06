import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';
import { VisuallyHidden } from './VisuallyHidden';

type LinkProps = ComponentProps<'a'> & {
  external?: boolean;
  variant?: 'text' | 'button' | 'outline';
};

const variantClasses = {
  text: 'text-ember-400 underline underline-offset-4 transition-colors duration-fast hover:text-ember-300',
  button:
    'inline-flex items-center gap-2.5 rounded-pill bg-ember-400 px-4.5 py-2.75 text-sm font-medium text-on-ember no-underline transition-colors duration-fast hover:bg-ember-200',
  outline:
    'inline-flex h-9.5 items-center gap-1.5 rounded-pill border border-ember-400/40 px-3.5 text-tag font-medium text-ember-400 no-underline transition-colors duration-fast hover:bg-ember-400/8',
} as const;

export function Link({
  external = false,
  variant = 'text',
  className,
  children,
  ...rest
}: LinkProps) {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={joinClassNames(variantClasses[variant], className)} {...externalProps} {...rest}>
      {children}
      {external && <VisuallyHidden>, abre em nova aba</VisuallyHidden>}
    </a>
  );
}
