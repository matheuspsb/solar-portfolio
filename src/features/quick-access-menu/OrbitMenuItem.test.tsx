import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrbitMenuItem } from './OrbitMenuItem';

describe('OrbitMenuItem', () => {
  it('keeps the code out of the accessible name', () => {
    render(<OrbitMenuItem label="Sobre" code="OBJ-001" tone="amber" onClick={() => undefined} />);
    expect(screen.getByRole('button')).toHaveAccessibleName('Sobre');
  });
});
