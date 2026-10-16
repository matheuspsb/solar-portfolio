import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnswerField } from './AnswerField';

const registration = {
  name: 'name',
  onChange: async () => undefined,
  onBlur: async () => undefined,
  ref: () => undefined,
};

function renderField({ multiline = false, focusOnMount = false } = {}) {
  return render(
    <AnswerField
      label="Como posso te chamar?"
      placeholder="Seu nome"
      multiline={multiline}
      type="text"
      autoComplete="name"
      maxLength={80}
      registration={registration}
      hasValue={false}
      isValid={false}
      isInvalid={false}
      describedBy="note"
      focusOnMount={focusOnMount}
    />,
  );
}

describe('AnswerField', () => {
  it.each([false, true])(
    'takes the focus when it appears if asked to (multiline %s)',
    (multiline) => {
      renderField({ multiline, focusOnMount: true });
      expect(screen.getByRole('textbox')).toHaveFocus();
    },
  );

  it.each([false, true])('leaves the focus alone when not asked to (multiline %s)', (multiline) => {
    renderField({ multiline });
    expect(screen.getByRole('textbox')).not.toHaveFocus();
  });

  it('hands the control to the form library so it can read and validate it', () => {
    const received: Array<HTMLInputElement | HTMLTextAreaElement | null> = [];
    render(
      <AnswerField
        label="Como posso te chamar?"
        placeholder="Seu nome"
        multiline={false}
        type="text"
        autoComplete="name"
        maxLength={80}
        registration={{ ...registration, ref: (element) => received.push(element) }}
        hasValue={false}
        isValid={false}
        isInvalid={false}
        describedBy="note"
        focusOnMount={false}
      />,
    );
    expect(received[0]).toBe(screen.getByRole('textbox'));
  });
});
