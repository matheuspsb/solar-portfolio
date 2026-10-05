import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Button } from './Button';

it('exposes a button role with its accessible name and defaults to type="button"', () => {
  render(<Button>Abrir</Button>);
  expect(screen.getByRole('button', { name: 'Abrir' })).toHaveAttribute('type', 'button');
});
