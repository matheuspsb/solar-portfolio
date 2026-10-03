// Use case: when the Sun is hovered or focused, sighted users get a visible label naming it
// (keyboard users have no other cue about what is focused). It must be absent when nothing is
// highlighted and must not duplicate the name for screen readers (the buttons already carry it).
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BodyHint } from './BodyHint';

describe('BodyHint', () => {
  it('shows the label text when there is one', () => {
    render(<BodyHint label="Sol · Sobre" />);
    expect(screen.getByText('Sol · Sobre')).toBeVisible();
  });

  it('renders nothing when there is no label', () => {
    const { container } = render(<BodyHint label={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('is hidden from the accessibility tree to avoid duplicate announcements', () => {
    render(<BodyHint label="Sol · Sobre" />);
    expect(screen.getByText('Sol · Sobre').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('does not intercept pointer events over the canvas', () => {
    render(<BodyHint label="Sol · Sobre" />);
    expect(screen.getByText('Sol · Sobre').closest('div')).toHaveClass('pointer-events-none');
  });
});
