import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuickAccessMenu } from './QuickAccessMenu';

const items = [
  { id: 'sun', label: 'Sobre', tone: 'amber' },
  { id: 'earth', label: 'Projetos', tone: 'cyan' },
] as const;

function setup(overrideItems: React.ComponentProps<typeof QuickAccessMenu>['items'] = items) {
  const onSelectItem = vi.fn();
  render(
    <>
      <button>fora</button>
      <QuickAccessMenu items={overrideItems} onSelectItem={onSelectItem} />
    </>,
  );
  return { user: userEvent.setup(), onSelectItem };
}

const getToggle = () => screen.getByRole('button', { name: 'Acesso rápido' });

describe('QuickAccessMenu', () => {
  it('is exposed as a navigation landmark so screen-reader users can jump to it', () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Acesso rápido' })).toContainElement(getToggle());
  });

  it('starts collapsed, announcing its state', () => {
    setup();
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Sobre' })).not.toBeInTheDocument();
  });

  it('keeps the destinations out of reach while collapsed (not focusable, not announced)', () => {
    setup();
    const list = screen.getByRole('list', { hidden: true });
    expect(list).toHaveAttribute('inert');
    expect(list).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens with a click and lists one control per item', async () => {
    const { user } = setup();
    await user.click(getToggle());
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Sobre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Projetos' })).toBeInTheDocument();
  });

  it('opens with Enter and Space from the keyboard and focuses the first item', async () => {
    const { user } = setup();
    await user.tab();
    await user.tab();
    expect(getToggle()).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Sobre' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await user.keyboard(' ');
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles closed when the toggle is pressed again (rapid double click)', async () => {
    const { user } = setup();
    await user.dblClick(getToggle());
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes with Escape and returns focus to the toggle', async () => {
    const { user } = setup();
    await user.click(getToggle());
    await user.keyboard('{Escape}');
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
    expect(getToggle()).toHaveFocus();
  });

  it('does nothing on Escape while collapsed', async () => {
    const { user } = setup();
    await user.keyboard('{Escape}');
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when clicking outside', async () => {
    const { user } = setup();
    await user.click(getToggle());
    await user.click(screen.getByRole('button', { name: 'fora' }));
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when keyboard focus leaves the menu', async () => {
    const { user } = setup();
    await user.click(getToggle());
    await user.tab();
    await user.tab();
    await user.tab();
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('stays open while a destination is being pressed even if focus goes nowhere, as in Safari', async () => {
    const { user, onSelectItem } = setup();
    await user.click(getToggle());
    const focusedItem = screen.getByRole('button', { name: 'Sobre' });
    expect(focusedItem).toHaveFocus();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Projetos' }));
    fireEvent.focusOut(focusedItem, { relatedTarget: null });
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Projetos' }));

    await user.click(screen.getByRole('button', { name: 'Projetos' }));
    expect(onSelectItem).toHaveBeenCalledWith('earth');
  });

  it('reports the chosen item, closes, and parks focus on the toggle', async () => {
    const { user, onSelectItem } = setup();
    await user.click(getToggle());
    await user.click(screen.getByRole('button', { name: 'Projetos' }));
    expect(onSelectItem).toHaveBeenCalledOnce();
    expect(onSelectItem).toHaveBeenCalledWith('earth');
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false');
    expect(getToggle()).toHaveFocus();
  });

  it('selects with the keyboard', async () => {
    const { user, onSelectItem } = setup();
    await user.click(getToggle());
    await user.keyboard('{Enter}');
    expect(onSelectItem).toHaveBeenCalledWith('sun');
  });

  it('moves between items with the arrow keys, wrapping around', async () => {
    const { user } = setup();
    await user.click(getToggle());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Projetos' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Sobre' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Projetos' })).toHaveFocus();
  });

  it('renders nothing when there are no items', () => {
    setup([]);
    expect(screen.queryByRole('button', { name: 'Acesso rápido' })).not.toBeInTheDocument();
  });
});
