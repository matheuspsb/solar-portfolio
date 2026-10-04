// Use case: each destination in the orbital menu is a button with a label card and a coloured
// planet. Its accessible name must be the destination ("Sobre"), not "Sobre OBJ-001": the catalog
// code is flavour for sighted users. It must be activatable by click and keyboard.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrbitMenuItem } from './OrbitMenuItem';

describe('OrbitMenuItem', () => {
  it('is named by its label and shows the code visually', () => {
    render(<OrbitMenuItem label="Sobre" code="OBJ-001" tone="amber" onClick={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Sobre' })).toBeInTheDocument();
    expect(screen.getByText('OBJ-001')).toBeInTheDocument();
  });

  it('keeps the code out of the accessible name', () => {
    render(<OrbitMenuItem label="Sobre" code="OBJ-001" tone="amber" onClick={() => undefined} />);
    expect(screen.getByRole('button')).toHaveAccessibleName('Sobre');
  });

  it('activates with click and with the keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OrbitMenuItem label="Sobre" code="OBJ-001" tone="amber" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('forwards the ref and key handlers for arrow navigation', async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLButtonElement | null };
    const onKeyDown = vi.fn();
    render(
      <OrbitMenuItem
        label="Sobre"
        code="OBJ-001"
        tone="amber"
        onClick={() => undefined}
        onKeyDown={onKeyDown}
        ref={ref}
      />,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    ref.current!.focus();
    await user.keyboard('{ArrowDown}');
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
