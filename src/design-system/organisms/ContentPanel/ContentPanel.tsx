import { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { useModalFocus } from '@/hooks/use-modal-focus';
import { PanelHeader } from '../../molecules/PanelHeader/PanelHeader';

type ContentPanelProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  getFallbackFocus?: () => HTMLElement | null;
  children: ReactNode;
};

export function ContentPanel({
  isOpen,
  title,
  onClose,
  getFallbackFocus,
  children,
}: ContentPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useModalFocus({ isOpen, containerRef: panelRef, onEscape: onClose, getFallbackFocus });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-(--z-panel) flex justify-end">
      <div
        data-testid="panel-backdrop"
        aria-hidden="true"
        className="animate-overlay-in absolute inset-0 bg-overlay"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="animate-panel-in relative flex h-full w-full flex-col border-l border-border bg-space-900/95 text-text-primary shadow-panel backdrop-blur-md outline-none sm:w-(--size-panel-width)"
      >
        <PanelHeader titleId={titleId} title={title} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
