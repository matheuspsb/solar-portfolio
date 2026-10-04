import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '@/design-system/atoms/Input';
import { FormField } from './FormField';

function renderField(error?: string) {
  render(
    <FormField label="Nome" error={error}>
      {(controlProps) => <Input {...controlProps} />}
    </FormField>,
  );
}

describe('FormField', () => {
  it('labels the control', () => {
    renderField();
    expect(screen.getByRole('textbox', { name: 'Nome' })).toBeInTheDocument();
  });

  it('keeps the control valid and without a description when there is no error', () => {
    renderField();
    const control = screen.getByRole('textbox', { name: 'Nome' });
    expect(control).toBeValid();
    expect(control).not.toHaveAccessibleDescription();
  });

  it('marks the control invalid and describes it with the error text', () => {
    renderField('Informe seu nome.');
    const control = screen.getByRole('textbox', { name: 'Nome' });
    expect(control).toBeInvalid();
    expect(control).toHaveAccessibleDescription('Informe seu nome.');
  });

  it('gives two fields independent ids', () => {
    render(
      <>
        <FormField label="A">{(props) => <Input {...props} />}</FormField>
        <FormField label="B">{(props) => <Input {...props} />}</FormField>
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'A' })).not.toBe(
      screen.getByRole('textbox', { name: 'B' }),
    );
  });
});
