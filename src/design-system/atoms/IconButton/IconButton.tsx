import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> & {
  label: string;
};

const baseClasses =
  'inline-flex size-9.5 cursor-pointer items-center justify-center rounded-pill border border-line-control bg-transparent p-0 text-ink-control transition-colors duration-fast ease-standard hover:border-ember-400 hover:text-ember-400';

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
      <span aria-hidden="true" className="inline-flex size-4.5 [&>svg]:size-full">
        {children}
      </span>
    </button>
  );
}
