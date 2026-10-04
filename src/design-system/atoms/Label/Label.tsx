import { createElement } from 'react';
import type { ComponentProps } from 'react';
import { joinClassNames } from '@/lib/join-class-names';

type LabelProps = ComponentProps<'span'> & {
  as?: 'span' | 'p' | 'div' | 'h2' | 'h3' | 'h4' | 'dt';
  tone?: 'muted' | 'accent' | 'accent-muted' | 'cool' | 'faint';
  size?: 'label' | 'eyebrow' | 'role';
};

const baseClasses = 'm-0 font-mono font-normal uppercase';

const toneClasses = {
  muted: 'text-ink-300',
  accent: 'text-ember-400',
  'accent-muted': 'text-ember-600',
  cool: 'text-nebula-300',
  faint: 'text-ink-400',
} as const;

const sizeClasses = {
  label: 'text-label tracking-label',
  eyebrow: 'text-eyebrow tracking-label',
  role: 'text-xs tracking-role',
} as const;

/** Small uppercase mono caption used for data labels and section titles. */
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
