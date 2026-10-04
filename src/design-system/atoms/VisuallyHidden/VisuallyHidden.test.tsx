// Use case: text only for assistive tech (e.g. canvas description). It must stay in the
// accessibility tree. If it were removed with display:none it would be silent for screen readers.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

it('renders the requested element and forwards props', () => {
  render(
    <VisuallyHidden as="div" role="group" aria-label="Controles">
      Menu
    </VisuallyHidden>,
  );
  expect(screen.getByRole('group', { name: 'Controles' }).tagName).toBe('DIV');
});
