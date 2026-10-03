import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type MenuItemProps = Omit<ComponentProps<'button'>, 'type'>;

const baseClasses =
  'flex min-h-(--size-touch-target) w-full cursor-pointer items-center rounded-md px-4 py-2 text-left text-base text-text-primary transition-colors duration-fast ease-standard hover:bg-surface-hover';

export function MenuItem({ children, className, ...rest }: MenuItemProps) {
  return (
    <button type="button" className={joinClassNames(baseClasses, className)} {...rest}>
      {children}
    </button>
  );
}
