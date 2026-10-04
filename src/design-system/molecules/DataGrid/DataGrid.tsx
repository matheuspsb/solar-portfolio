import type { ReactNode } from 'react';

type DataGridProps = {
  children: ReactNode;
};

/** Bordered two-column grid of `DataCell`s, read as a description list. */
export function DataGrid({ children }: DataGridProps) {
  return (
    <dl className="m-0 grid grid-cols-2 overflow-hidden rounded-block border border-line">
      {children}
    </dl>
  );
}
