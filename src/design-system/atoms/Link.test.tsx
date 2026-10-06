import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Link } from './Link';

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
