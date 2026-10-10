import { describe, expect, it } from 'vitest';
import { contactContent } from '@/content/contact';
import { getActionPresentation } from './action-presentation';

const { actions } = contactContent;

describe('getActionPresentation', () => {
  it('offers to send on the last question', () => {
    expect(getActionPresentation({ isSending: false, isLastStep: true, actions })).toEqual({
      label: 'Enviar mensagem',
      icon: '↗',
    });
  });

  it('says it is transmitting while sending, whatever the step', () => {
    const expected = { label: 'Transmitindo…', icon: '✦' };
    expect(getActionPresentation({ isSending: true, isLastStep: true, actions })).toEqual(expected);
    expect(getActionPresentation({ isSending: true, isLastStep: false, actions })).toEqual(
      expected,
    );
  });
});
