import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';
import { formControlClasses } from './form-control-classes';

export function Textarea({ className, ...rest }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={joinClassNames(formControlClasses, 'min-h-32 resize-y', className)}
      {...rest}
    />
  );
}
