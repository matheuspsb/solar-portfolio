import { createElement } from 'react';
import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type VisuallyHiddenProps = ComponentProps<'span'> & {
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
};

export function VisuallyHidden({ as = 'span', className, ...rest }: VisuallyHiddenProps) {
  return createElement(as, { className: joinClassNames('sr-only', className), ...rest });
}
