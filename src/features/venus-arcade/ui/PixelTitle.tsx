import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type PixelTitleProps = ComponentProps<'h2'> & {
  tone?: 'phosphor' | 'alert' | 'root';
};

const toneClasses = {
  phosphor: 'text-venus-phosphor',
  alert: 'text-venus-alert',
  root: 'text-venus-root',
} as const;

export function PixelTitle({ tone = 'phosphor', className, ...rest }: PixelTitleProps) {
  return (
    <h2
      className={joinClassNames(
        'font-pixel text-pixel-title leading-none text-shadow-pixel-glow',
        toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}
