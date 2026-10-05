import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
