import type { StackItem } from '@/domain/celestial-body';
import { PlanetDot } from '@/components/PlanetDot';

export function StackChip({ name, tone, size }: StackItem) {
  return (
    <li className="flex items-center gap-2 rounded-pill border border-line-chip bg-chip py-1.75 pr-3 pl-2.25 text-tag text-ink-100 transition-colors duration-fast hover:border-ember-400/33">
      <PlanetDot tone={tone} size={size} />
      {name}
    </li>
  );
}
