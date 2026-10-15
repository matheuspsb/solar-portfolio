import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useQuickAccessMenu } from './use-quick-access-menu';

const ids = ['sun', 'mercury'];

function Harness() {
  const { containerRef, toggleRef, menu } = useQuickAccessMenu(ids);
  return (
    <nav
      ref={containerRef}
      onBlur={menu.closeWhenFocusLeaves}
      onPointerDown={menu.markPressStart}
      onPointerUp={menu.markPressEnd}
    >
      <button ref={toggleRef} onClick={menu.toggle} aria-expanded={menu.isOpen}>
        toggle
      </button>
      {ids.map((id) => (
        <button key={id} ref={menu.registerItem(id)} onClick={menu.closeAndRestoreFocus}>
          {id}
        </button>
      ))}
      <output>{menu.isOpen ? 'aberto' : 'fechado'}</output>
    </nav>
  );
}

describe('useQuickAccessMenu', () => {
  it('starts closed', () => {
    render(<Harness />);
    expect(screen.getByRole('status')).toHaveTextContent('fechado');
  });

  it('opens and puts the focus on the first item in the same gesture', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByRole('status')).toHaveTextContent('aberto');
    expect(screen.getByRole('button', { name: 'sun' })).toHaveFocus();
  });

  it('closes on a second toggle without sending the focus to an item', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const toggle = screen.getByRole('button', { name: 'toggle' });
    await user.click(toggle);
    await user.click(toggle);
    expect(screen.getByRole('status')).toHaveTextContent('fechado');
    expect(screen.getByRole('button', { name: 'sun' })).not.toHaveFocus();
  });

  it('closes and returns the focus to the toggle when asked to', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    await user.click(screen.getByRole('button', { name: 'mercury' }));
    expect(screen.getByRole('status')).toHaveTextContent('fechado');
    expect(screen.getByRole('button', { name: 'toggle' })).toHaveFocus();
  });

  it('closes when focus leaves the menu, but not while a press is in progress with nowhere to go', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    const item = screen.getByRole('button', { name: 'sun' });
    fireEvent.pointerDown(item);
    fireEvent.focusOut(item, { relatedTarget: null });
    expect(screen.getByRole('status')).toHaveTextContent('aberto');
    await act(async () => {
      fireEvent.pointerUp(item);
    });
    fireEvent.focusOut(item, { relatedTarget: null });
    expect(screen.getByRole('status')).toHaveTextContent('fechado');
  });

  it('keeps the menu open when focus moves between its own controls', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    await user.tab();
    expect(screen.getByRole('status')).toHaveTextContent('aberto');
    expect(screen.getByRole('button', { name: 'mercury' })).toHaveFocus();
  });
});
