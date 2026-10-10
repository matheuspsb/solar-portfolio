import { createElement } from 'react';
import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type LabelProps = ComponentProps<'span'> & {
  as?: 'span' | 'p' | 'h2' | 'h3' | 'h4' | 'dt';
  tone?: 'muted' | 'accent' | 'faint';
  size?: 'label' | 'eyebrow' | 'role' | 'code';
};

const baseClasses = 'm-0 font-mono font-normal uppercase';

const toneClasses = {
  muted: 'text-ink-300',
  accent: 'text-ember-400',
  faint: 'text-ink-400',
} as const;

const sizeClasses = {
  label: 'text-label tracking-label',
  eyebrow: 'text-eyebrow tracking-label',
  role: 'text-xs tracking-role',
  code: 'text-label tracking-code',
} as const;

export function Label({
  as = 'span',
  tone = 'muted',
  size = 'label',
  className,
  ...rest
}: LabelProps) {
  return createElement(as, {
    className: joinClassNames(baseClasses, toneClasses[tone], sizeClasses[size], className),
    ...rest,
  });
}
