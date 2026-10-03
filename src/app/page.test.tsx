// Use case: a visitor lands on the home page and expects to find the owner's name as main heading.
// If this failed, the page would be blank or unlabeled for screen readers.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import HomePage from './page';

it('shows the owner name as the main heading', () => {
  render(<HomePage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Matheus' })).toBeInTheDocument();
});
