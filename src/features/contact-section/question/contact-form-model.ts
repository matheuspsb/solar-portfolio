import type { FormEvent, KeyboardEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import type { ActionPresentation } from './action-presentation';
import type { ContactFlowState } from './contact-flow';
import type { InputAttributes } from './input-attributes';

export type ContactFormModel = {
  noteId: string;
  stepKey: string;
  kicker: string;
  question: string;
  placeholder: string;
  attributes: InputAttributes;
  registration: UseFormRegisterReturn;
  fieldMotion: ContactFlowState['fieldMotion'];
  answerLength: number;
  hasValue: boolean;
  isValid: boolean;
  hasError: boolean;
  note: string;
  action: ActionPresentation;
  isSending: boolean;
  canGoBack: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: () => void;
  onKeyDown: ((event: KeyboardEvent<HTMLFormElement>) => void) | undefined;
  onBack: () => void;
};
