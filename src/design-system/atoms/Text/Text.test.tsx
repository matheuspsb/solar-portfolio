// Use case: body copy renders in the requested element with native props forwarded. If it
// ignored `as`, lists or labels would end up with the wrong semantics.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Text } from './Text';

it('renders a paragraph by default', () => {
  render(<Text>Olá</Text>);
  expect(screen.getByText('Olá').tagName).toBe('P');
});

it('renders the requested element', () => {
  render(<Text as="span">Olá</Text>);
  expect(screen.getByText('Olá').tagName).toBe('SPAN');
});

it('forwards native props', () => {
  render(<Text lang="en">Hello</Text>);
  expect(screen.getByText('Hello')).toHaveAttribute('lang', 'en');
});

it.each(['body', 'caption'] as const)('supports the %s size', (size) => {
  render(<Text size={size}>Texto</Text>);
  expect(screen.getByText('Texto')).toBeInTheDocument();
});

it('uses different classes for different sizes', () => {
  render(
    <>
      <Text size="body">Corpo</Text>
      <Text size="caption">Legenda</Text>
    </>,
  );
  expect(screen.getByText('Corpo').className).not.toBe(screen.getByText('Legenda').className);
});
