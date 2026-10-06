import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SceneKeyboardControls } from './SceneKeyboardControls';

const items = [
  { id: 'sun', label: 'Sol: Sobre' },
  { id: 'earth', label: 'Terra: Projetos' },
  { id: 'mars', label: 'Marte: Contato' },
];

function setup(overrides: Partial<React.ComponentProps<typeof SceneKeyboardControls>> = {}) {
  const handlers = { onItemFocus: vi.fn(), onItemBlur: vi.fn(), onItemActivate: vi.fn() };
  render(
    <>
      <button>antes</button>
      <SceneKeyboardControls
        groupLabel="Corpos celestes"
        items={items}
        {...handlers}
        {...overrides}
      />
      <button>depois</button>
    </>,
  );
  return { user: userEvent.setup(), ...handlers };
}

describe('SceneKeyboardControls', () => {
  it('exposes a labelled group with one named button per body', () => {
    setup();
    const group = screen.getByRole('group', { name: 'Corpos celestes' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sol: Sobre' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(items.length + 2);
  });

  it('is reachable with Tab and reports focus and blur', async () => {
    const { user, onItemFocus, onItemBlur } = setup();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Sol: Sobre' })).toHaveFocus();
    expect(onItemFocus).toHaveBeenLastCalledWith('sun');
    await user.tab();
    expect(onItemBlur).toHaveBeenCalledWith('sun');
  });

  it('moves focus with arrow keys and wraps around', async () => {
    const { user } = setup();
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Terra: Projetos' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Marte: Contato' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Sol: Sobre' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Marte: Contato' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Terra: Projetos' })).toHaveFocus();
  });

  it('keeps a single body focused when there is only one (arrows do nothing harmful)', async () => {
    const { user } = setup({ items: [items[0]!] });
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Sol: Sobre' })).toHaveFocus();
  });

  it('renders nothing for an empty list', () => {
    setup({ items: [] });
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('does not steal arrow keys that are not navigation', async () => {
    const { user } = setup();
    await user.tab();
    await user.tab();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Sol: Sobre' })).toHaveFocus();
  });
});
