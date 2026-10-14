'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import { arcadeContent } from '@/content/arcade';
import { useModalFocus } from '@/hooks/use-modal-focus';

type ArcadeExperienceProps = {
  onExit: () => void;
  getFallbackFocus?: () => HTMLElement | null;
  menu: ReactNode;
};

export function ArcadeExperience({ onExit, getFallbackFocus, menu }: ArcadeExperienceProps) {
  const arcadeRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen: true, containerRef: arcadeRef, onEscape: onExit, getFallbackFocus });

  return (
    <div
      ref={arcadeRef}
      role="dialog"
      aria-modal="true"
      aria-label={arcadeContent.dialogLabel}
      tabIndex={-1}
      className="fixed inset-0 z-(--z-panel) flex flex-col bg-space-950 text-ink-100 outline-none"
    >
      <header className="flex px-5 pt-5">
        <Button variant="secondary" aria-label={arcadeContent.backLabel.long} onClick={onExit}>
          <span aria-hidden="true" className="text-ember-400">
            ←
          </span>
          <span className="max-xs:hidden md:hidden">{arcadeContent.backLabel.short}</span>
          <span className="max-md:hidden">{arcadeContent.backLabel.long}</span>
        </Button>
        {menu}
      </header>
      <div className="flex flex-1 items-center justify-center">
        <p className="font-mono text-ink-100">{arcadeContent.title}</p>
      </div>
    </div>
  );
}
