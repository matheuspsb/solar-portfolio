import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useModalFocus } from '@/hooks/use-modal-focus';
import { PanelHeader } from '../../molecules/PanelHeader/PanelHeader';

type ContentPanelProps = {
  isOpen: boolean;
  /** Accessible name of the dialog. */
  title: string;
  /** Caption shown in the header, e.g. "Sobre · Objeto 001". */
  panelLabel: string;
  onClose: () => void;
  getFallbackFocus?: () => HTMLElement | null;
  /** Pinned to the bottom of the panel (credits, legal notes). */
  footer?: ReactNode;
  children: ReactNode;
};

export function ContentPanel({
  isOpen,
  title,
  panelLabel,
  onClose,
  getFallbackFocus,
  footer,
  children,
}: ContentPanelProps) {
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
        aria-label={title}
        tabIndex={-1}
        className="animate-panel-in relative flex h-full w-full flex-col overflow-hidden border-l border-line bg-linear-to-b from-panel-start to-panel-end text-ink-100 shadow-panel outline-none sm:w-(--size-panel-width)"
      >
        <PanelHeader label={panelLabel} onClose={onClose} />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-7">
          <div className="pb-6">{children}</div>
          {footer && <div className="mt-auto border-t border-line-faint pt-4">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
