import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';
import { formControlClasses } from './form-control-classes';

export function Input({ className, ...rest }: ComponentProps<'input'>) {
  return <input className={joinClassNames(formControlClasses, className)} {...rest} />;
}
