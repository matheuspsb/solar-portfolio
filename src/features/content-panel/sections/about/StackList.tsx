import type { StackItem } from '@/lib/celestial-body';
import { StackChip } from './StackChip';

type StackListProps = {
  label: string;
  items: readonly StackItem[];
};

export function StackList({ label, items }: StackListProps) {
  if (items.length === 0) return null;

  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((item, index) => (
        <StackChip key={`${item.name}-${index}`} {...item} />
      ))}
    </ul>
  );
}
