import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { IconButton } from './IconButton';

it('is named by its label and hides the decorative icon', () => {
  render(
    <IconButton label="Fechar painel">
      <svg data-icon />
    </IconButton>,
  );
  expect(screen.getByRole('button', { name: 'Fechar painel' })).toBeInTheDocument();
});
