// Use case: the panel header tells the visitor what they opened ("SOBRE · OBJETO 001") and offers a
// clear way out. If the close button lost its name or its handler, keyboard and screen-reader users
// could not dismiss the panel from the header.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PanelHeader } from './PanelHeader';

describe('PanelHeader', () => {
  it('shows the label it was given', () => {
    render(<PanelHeader label="Sobre · Objeto 001" onClose={() => undefined} />);
    expect(screen.getByText('Sobre · Objeto 001')).toBeInTheDocument();
  });

  it('closes through a named button', async () => {
    const onClose = vi.fn();
    render(<PanelHeader label="Sobre" onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fechar painel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes from the keyboard', async () => {
    const onClose = vi.fn();
    render(<PanelHeader label="Sobre" onClose={onClose} />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps the label out of the heading outline (the person name is the panel heading)', () => {
    render(<PanelHeader label="Sobre · Objeto 001" onClose={() => undefined} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
