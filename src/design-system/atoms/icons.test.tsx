// Use case: icons next to text or inside labelled buttons are decoration. They must never be
// announced or focusable, otherwise a "Fechar painel" button would read an extra empty graphic.
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArrowUpRightIcon } from './ArrowUpRightIcon';
import { CloseIcon } from './CloseIcon';

describe.each([CloseIcon, ArrowUpRightIcon])('icon #%#', (Icon) => {
  it('is a decorative svg: hidden and not focusable', () => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('inherits the surrounding text color', () => {
    const { container } = render(<Icon />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
  });

  it('forwards extra props such as a class name', () => {
    const { container } = render(<Icon className="size-4" />);
    expect(container.querySelector('svg')).toHaveClass('size-4');
  });
});
