// Use case: body copy is a real paragraph and forwards native props (role, lang, id), so callers
// such as the fallback notice can turn it into a live region without wrapping it again.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Text } from './Text';

it('renders a paragraph', () => {
  render(<Text>Olá</Text>);
  expect(screen.getByText('Olá').tagName).toBe('P');
});

it('forwards native props such as role', () => {
  render(<Text role="status">Aviso</Text>);
  expect(screen.getByRole('status')).toHaveTextContent('Aviso');
});
