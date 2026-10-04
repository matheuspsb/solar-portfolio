// Use case: the contact form needs text fields that behave like native inputs (typing, refs from
// react-hook-form, aria attributes) and flag an invalid state visually and for assistive tech.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';
import { Textarea } from './Textarea';

describe.each([
  { name: 'Input', renderControl: (props = {}) => <Input aria-label="Campo" {...props} /> },
  { name: 'Textarea', renderControl: (props = {}) => <Textarea aria-label="Campo" {...props} /> },
])('$name', ({ renderControl }) => {
  it('accepts typing like a native control', async () => {
    render(renderControl());
    await userEvent.type(screen.getByRole('textbox', { name: 'Campo' }), 'olá');
    expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveValue('olá');
  });

  it('forwards native attributes such as disabled and aria-invalid', () => {
    render(renderControl({ disabled: true, 'aria-invalid': true }));
    const control = screen.getByRole('textbox', { name: 'Campo' });
    expect(control).toBeDisabled();
    expect(control).toBeInvalid();
  });
});

describe('ref forwarding', () => {
  it('exposes the DOM element through ref as a prop (React 19), as react-hook-form needs', () => {
    const inputRef = createRef<HTMLInputElement>();
    const textareaRef = createRef<HTMLTextAreaElement>();
    render(
      <>
        <Input ref={inputRef} aria-label="a" />
        <Textarea ref={textareaRef} aria-label="b" />
      </>,
    );
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(textareaRef.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});
