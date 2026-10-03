// Use case: icon-only controls (close, menu) must be understood by screen-reader users. If the
// accessible label were missing the control would be announced as just "button".
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

it('is named by its label and hides the decorative icon', () => {
  render(
    <IconButton label="Fechar painel">
      <svg data-icon />
    </IconButton>,
  );
  expect(screen.getByRole('button', { name: 'Fechar painel' })).toBeInTheDocument();
});

it('activates on click', async () => {
  const onClick = vi.fn();
  render(
    <IconButton label="Fechar" onClick={onClick}>
      <svg />
    </IconButton>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  expect(onClick).toHaveBeenCalledOnce();
});

it('forwards native props and ref', () => {
  const ref = { current: null as HTMLButtonElement | null };
  render(
    <IconButton ref={ref} label="Menu" aria-expanded="false">
      <svg />
    </IconButton>,
  );
  expect(ref.current).toBe(screen.getByRole('button', { name: 'Menu' }));
  expect(ref.current).toHaveAttribute('aria-expanded', 'false');
});
