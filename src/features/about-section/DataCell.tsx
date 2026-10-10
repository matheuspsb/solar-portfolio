import type { ReactNode } from 'react';
import { Label } from '@/components/Label';

type DataCellProps = {
  label: string;
  children: ReactNode;
};

export function DataCell({ label, children }: DataCellProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-line p-4 not-last:border-r">
      <Label as="dt">{label}</Label>
      <dd className="m-0 flex flex-col gap-1.5">{children}</dd>
    </div>
  );
}
