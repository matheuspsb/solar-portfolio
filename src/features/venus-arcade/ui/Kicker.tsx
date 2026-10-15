import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

export function Kicker({ className, ...rest }: ComponentProps<'p'>) {
  return (
    <p
      className={joinClassNames(
        'font-mono text-label tracking-caps text-arcade-ink-300 uppercase',
        className,
      )}
      {...rest}
    />
  );
}
