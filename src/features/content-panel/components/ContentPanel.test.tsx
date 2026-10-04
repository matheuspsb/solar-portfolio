import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ContentPanel } from './ContentPanel';

function Harness({
  getFallbackFocus,
  withLink = true,
}: {
  getFallbackFocus?: () => HTMLElement | null;
  withLink?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir</button>
      <ContentPanel
        isOpen={isOpen}
        title="Sobre"
        panelLabel="Sobre · Objeto 001"
        footer={<p>Créditos</p>}
        onClose={() => setIsOpen(false)}
        getFallbackFocus={getFallbackFocus}
      >
        <p>Conteúdo</p>
        {withLink && <a href="https://example.com">Link interno</a>}
      </ContentPanel>
    </>
  );
}

describe('ContentPanel', () => {
  it('renders nothing while closed', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a modal dialog named by its title and takes focus', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Sobre' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveFocus();
    expect(screen.getByText('Sobre · Objeto 001')).toBeInTheDocument();
  });

  it('shows the footer content after the main content', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    const content = screen.getByText('Conteúdo');
    const footer = screen.getByText('Créditos');
    expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('closes with the close button', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.click(screen.getByRole('button', { name: 'Fechar painel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with Escape and returns focus to the opener', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    await user.click(opener);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it('ignores Escape while closed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ContentPanel isOpen={false} title="Sobre" panelLabel="Sobre · Objeto 001" onClose={onClose}>
        <p>x</p>
      </ContentPanel>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when clicking outside the panel, but not when clicking inside', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.click(screen.getByText('Conteúdo'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByTestId('panel-backdrop'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps Tab inside the panel, wrapping from last to first', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fechar painel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Link interno' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fechar painel' })).toHaveFocus();
  });

  it('keeps Shift+Tab inside the panel, wrapping from first to last', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.tab();
    await user.tab({ shift: true });
    expect(screen.getByRole('link', { name: 'Link interno' })).toHaveFocus();
  });

  it('keeps focus on the only focusable element when there is nothing else', async () => {
    const user = userEvent.setup();
    render(<Harness withLink={false} />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fechar painel' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Fechar painel' })).toHaveFocus();
  });

  it('pulls focus back inside if it escapes the panel while open', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Fora</button>
        <ContentPanel
          isOpen
          title="Sobre"
          panelLabel="Sobre · Objeto 001"
          onClose={() => undefined}
        >
          <p>x</p>
        </ContentPanel>
      </>,
    );
    screen.getByRole('button', { name: 'Fora' }).focus();
    await user.keyboard('{Tab}');
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });

  it('uses the fallback focus target when opened without a focused origin', async () => {
    const fallbackTarget = document.createElement('button');
    fallbackTarget.textContent = 'Corpo celeste';
    document.body.append(fallbackTarget);
    const getFallbackFocus = vi.fn(() => fallbackTarget);
    const { rerender } = render(
      <ContentPanel
        isOpen={false}
        title="Sobre"
        panelLabel="Sobre · Objeto 001"
        onClose={() => undefined}
        getFallbackFocus={getFallbackFocus}
      >
        <p>x</p>
      </ContentPanel>,
    );
    (document.activeElement as HTMLElement | null)?.blur();
    rerender(
      <ContentPanel
        isOpen
        title="Sobre"
        panelLabel="Sobre · Objeto 001"
        onClose={() => undefined}
        getFallbackFocus={getFallbackFocus}
      >
        <p>x</p>
      </ContentPanel>,
    );
    rerender(
      <ContentPanel
        isOpen={false}
        title="Sobre"
        panelLabel="Sobre · Objeto 001"
        onClose={() => undefined}
        getFallbackFocus={getFallbackFocus}
      >
        <p>x</p>
      </ContentPanel>,
    );
    expect(fallbackTarget).toHaveFocus();
    fallbackTarget.remove();
  });

  it('does not crash when the origin no longer exists at close time', async () => {
    function VanishingOpenerHarness() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          {!isOpen && <button onClick={() => setIsOpen(true)}>Abrir</button>}
          <ContentPanel
            isOpen={isOpen}
            title="Sobre"
            panelLabel="Sobre · Objeto 001"
            onClose={() => setIsOpen(false)}
          >
            <p>x</p>
          </ContentPanel>
        </>
      );
    }
    const user = userEvent.setup();
    render(<VanishingOpenerHarness />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
