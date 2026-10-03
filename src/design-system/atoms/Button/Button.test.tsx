// Use case: any user (mouse or keyboard) activates an action by name. If Button broke, the
// panel and menu could not be operated, or a button inside a form would submit it by accident.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { Button } from './Button';

it('exposes a button role with its accessible name and defaults to type="button"', () => {
  render(<Button>Abrir</Button>);
  expect(screen.getByRole('button', { name: 'Abrir' })).toHaveAttribute('type', 'button');
});

it('calls onClick on click and on keyboard activation', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Abrir</Button>);
  await user.click(screen.getByRole('button'));
  await user.keyboard('{Enter}');
  await user.keyboard(' ');
  expect(onClick).toHaveBeenCalledTimes(3);
});

it('does not fire when disabled', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Abrir
    </Button>,
  );
  await user.click(screen.getByRole('button'));
  expect(onClick).not.toHaveBeenCalled();
});

it('forwards native props and the ref to the underlying element', () => {
  const ref = { current: null as HTMLButtonElement | null };
  render(
    <Button ref={ref} aria-expanded="true" type="submit">
      Abrir
    </Button>,
  );
  expect(ref.current).toBe(screen.getByRole('button'));
  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
});

it.each(['primary', 'secondary', 'floating'] as const)(
  'supports the %s variant without changing semantics',
  (variant) => {
    render(<Button variant={variant}>Fechar</Button>);
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveAttribute('type', 'button');
  },
);
