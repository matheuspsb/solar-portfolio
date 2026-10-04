import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Link } from './Link';

it('renders an internal link without new-tab behavior', () => {
  render(<Link href="/sobre">Sobre</Link>);
  const link = screen.getByRole('link', { name: 'Sobre' });
  expect(link).toHaveAttribute('href', '/sobre');
  expect(link).not.toHaveAttribute('target');
});

it('opens external links in a new tab with safe rel', () => {
  render(
    <Link href="https://linkedin.com/in/x" external>
      LinkedIn
    </Link>,
  );
  const link = screen.getByRole('link', { name: /LinkedIn/ });
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
});

it('announces that an external link opens in a new tab', () => {
  render(
    <Link href="https://linkedin.com/in/x" external>
      LinkedIn
    </Link>,
  );
  expect(screen.getByRole('link')).toHaveAccessibleName('LinkedIn, abre em nova aba');
});

describe('Link as a button', () => {
  it('keeps link semantics and external safety with the button look', () => {
    render(
      <Link href="https://linkedin.com/in/x" external variant="button">
        LinkedIn
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/x');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAccessibleName('LinkedIn, abre em nova aba');
  });
});
