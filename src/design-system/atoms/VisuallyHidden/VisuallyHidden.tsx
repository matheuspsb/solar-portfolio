import type { ComponentProps, ElementType } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type VisuallyHiddenProps = ComponentProps<'span'> & {
  as?: ElementType;
};

export function VisuallyHidden({ as: Element = 'span', className, ...rest }: VisuallyHiddenProps) {
  return <Element className={joinClassNames('sr-only', className)} {...rest} />;
}
