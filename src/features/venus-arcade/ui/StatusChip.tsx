import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type StatusChipProps = ComponentProps<'span'> & {
  tone?: 'phosphor' | 'root' | 'alert';
};

const toneClasses = {
  phosphor: 'border-venus-phosphor/60 text-venus-phosphor',
  root: 'border-venus-root/60 text-venus-root',
  alert: 'border-venus-alert/60 text-venus-alert',
} as const;

export function StatusChip({ tone = 'phosphor', className, ...rest }: StatusChipProps) {
  return (
    <span
      className={joinClassNames(
        'inline-flex items-center rounded-xs border px-2.5 py-1 font-pixel text-eyebrow tracking-caps uppercase',
        toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}
