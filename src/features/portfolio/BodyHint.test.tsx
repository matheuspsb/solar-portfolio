import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BodyHint } from './BodyHint';

describe('BodyHint', () => {
  it('renders nothing when there is no label', () => {
    const { container } = render(<BodyHint label={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden from the accessibility tree to avoid duplicate announcements', () => {
    render(<BodyHint label="Sol · Sobre" />);
    expect(screen.getByText('Sol · Sobre').closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
