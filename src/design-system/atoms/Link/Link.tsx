import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';

type LinkProps = ComponentProps<'a'> & {
  external?: boolean;
  /** `button` keeps link semantics but looks like a primary pill button. */
  variant?: 'text' | 'button';
};

const variantClasses = {
  text: 'text-ember-400 underline underline-offset-4 transition-colors duration-fast hover:text-ember-300',
  button:
    'inline-flex items-center gap-2.5 rounded-pill bg-ember-400 px-4.5 py-2.75 text-sm font-medium text-on-ember no-underline transition-colors duration-fast hover:bg-ember-200',
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
