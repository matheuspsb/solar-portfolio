// Use case: a visitor lands on the home page and expects exactly one main heading (the page outline starts there).
// If this failed, the page would be blank or unlabeled for screen readers.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import HomePage from './page';

it('has a single level-1 heading', () => {
  render(<HomePage />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
});
