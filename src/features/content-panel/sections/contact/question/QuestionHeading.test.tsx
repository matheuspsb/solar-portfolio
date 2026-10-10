import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuestionHeading } from './QuestionHeading';

describe('QuestionHeading', () => {
  it('is announced as one sentence, not as separate words', () => {
    render(<QuestionHeading kicker="01 / 03" text="Oi! Como posso te chamar?" />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Oi! Como posso te chamar?' }),
    ).toBeInTheDocument();
  });
});
