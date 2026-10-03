import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> & {
  label: string;
};

const baseClasses =
  'inline-flex size-(--size-touch-target) cursor-pointer items-center justify-center rounded-pill border border-border bg-surface p-0 text-text-primary backdrop-blur-sm transition-colors duration-fast ease-standard hover:border-border-strong hover:bg-surface-hover';

export function IconButton({
  label,
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={joinClassNames(baseClasses, className)}
      {...rest}
    >
      <span aria-hidden="true" className="inline-flex size-5 [&>svg]:size-full">
        {children}
      </span>
    </button>
  );
}
