import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrbitMenuToggle } from './OrbitMenuToggle';

const baseProps = { label: 'Acesso rápido', controlsId: 'orbit-list', onClick: () => undefined };

describe('OrbitMenuToggle', () => {
  it('is named by its label only (the planet adds nothing to the name)', () => {
    render(<OrbitMenuToggle {...baseProps} isOpen={false} />);
    expect(screen.getByRole('button', { name: 'Acesso rápido' })).toBeInTheDocument();
  });

  it('announces collapsed and expanded states and the list it controls', () => {
    const { rerender } = render(<OrbitMenuToggle {...baseProps} isOpen={false} />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'orbit-list');
    rerender(<OrbitMenuToggle {...baseProps} isOpen />);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('activates with click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<OrbitMenuToggle {...baseProps} isOpen={false} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('forwards the ref to the button so focus can be restored to it', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<OrbitMenuToggle {...baseProps} isOpen={false} ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('button'));
  });
});
