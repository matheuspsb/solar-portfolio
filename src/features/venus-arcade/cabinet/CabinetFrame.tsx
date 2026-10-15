import type { ReactNode } from 'react';
import { arcadeContent } from '@/content/arcade';
import { CrtOverlays } from './CrtOverlays';

const { cabinet } = arcadeContent;

type CabinetFrameProps = { children: ReactNode };

export function CabinetFrame({ children }: CabinetFrameProps) {
  return (
    <div className="relative min-h-0 w-[min(1080px,100%)] max-h-195 flex-1 rounded-[26px] border border-arcade-cabinet-edge bg-linear-to-b from-arcade-cabinet-high to-arcade-cabinet-low p-[20px_8px_8px] shadow-cabinet min-[720px]:p-[22px_14px_14px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-7 top-1.5 flex justify-between font-mono text-arcade-cabinet-caption tracking-[0.24em] text-arcade-cabinet-label"
      >
        <span>{cabinet.label}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-ember-400 shadow-led motion-safe:animate-arcade-led-fast" />
          {cabinet.power}
        </span>
      </div>
      <div className="relative size-full overflow-hidden rounded-2xl bg-arcade-screen shadow-screen">
        {children}
        <CrtOverlays />
      </div>
    </div>
  );
}
