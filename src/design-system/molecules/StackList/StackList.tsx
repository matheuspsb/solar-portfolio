type StackListProps = {
  label: string;
  items: readonly string[];
};

export function StackList({ label, items }: StackListProps) {
  if (items.length === 0) return null;

  return (
    <ul aria-label={label} className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="rounded-pill border border-border bg-space-700 px-3 py-1 text-sm text-text-primary"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
