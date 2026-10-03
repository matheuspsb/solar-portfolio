// Use case: text only for assistive tech (e.g. canvas description). It must stay in the
// accessibility tree. If it were removed with display:none it would be silent for screen readers.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

it('keeps content available to the accessibility tree', () => {
  render(<VisuallyHidden>Descrição</VisuallyHidden>);
  expect(screen.getByText('Descrição')).toBeInTheDocument();
});

it('renders the requested element and forwards props', () => {
  render(
    <VisuallyHidden as="h2" id="hidden-title">
      Menu
    </VisuallyHidden>,
  );
  expect(screen.getByRole('heading', { level: 2, name: 'Menu' })).toHaveAttribute(
    'id',
    'hidden-title',
  );
});
