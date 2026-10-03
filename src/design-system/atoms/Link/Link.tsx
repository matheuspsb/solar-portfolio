import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';

type LinkProps = ComponentProps<'a'> & {
  external?: boolean;
};

const baseClasses = 'text-sun-300 underline underline-offset-4 hover:text-sun-400';

export function Link({ external = false, className, children, ...rest }: LinkProps) {
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={joinClassNames(baseClasses, className)} {...externalProps} {...rest}>
      {children}
      {external && ' '}
      {external && <VisuallyHidden>(abre em nova aba)</VisuallyHidden>}
    </a>
  );
}
