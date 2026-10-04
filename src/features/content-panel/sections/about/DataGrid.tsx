import type { ReactNode } from 'react';

type DataGridProps = {
  children: ReactNode;
};

export function DataGrid({ children }: DataGridProps) {
  return (
    <dl className="m-0 grid grid-cols-2 overflow-hidden rounded-block border border-line">
      {children}
    </dl>
  );
}
