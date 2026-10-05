import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});
