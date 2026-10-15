import type { ReactNode } from 'react';
import { CabinetFrame } from './CabinetFrame';
import { KeyLegend } from './KeyLegend';
import { SideCabinets } from './SideCabinets';

type CabinetShellProps = {
  showsLegend: boolean;
  children: ReactNode;
};

export function CabinetShell({ showsLegend, children }: CabinetShellProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-3.5 overflow-hidden bg-[radial-gradient(ellipse_at_50%_125%,var(--color-arcade-backdrop-glow)_0%,var(--color-arcade-backdrop-mid)_42%,var(--color-arcade-backdrop-deep)_72%)] px-2 pt-17 pb-2.5 min-[720px]:px-6 min-[720px]:pt-19 min-[720px]:pb-4.5">
      <SideCabinets />
      <CabinetFrame>{children}</CabinetFrame>
      {showsLegend && <KeyLegend />}
    </div>
  );
}
