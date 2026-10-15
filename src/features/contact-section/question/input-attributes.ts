import { CONTACT_MESSAGE_LIMITS } from '@/domain/contact-message';
import type { ContactField } from '@/domain/contact-message';

export type InputAttributes = {
  type: 'text' | 'email';
  autoComplete: string;
  multiline: boolean;
  maxLength: number;
};

export const INPUT_ATTRIBUTES: Record<ContactField, InputAttributes> = {
  name: {
    type: 'text',
    autoComplete: 'name',
    multiline: false,
    maxLength: CONTACT_MESSAGE_LIMITS.nameMax,
  },
  email: {
    type: 'email',
    autoComplete: 'email',
    multiline: false,
    maxLength: CONTACT_MESSAGE_LIMITS.emailMax,
  },
  message: {
    type: 'text',
    autoComplete: 'off',
    multiline: true,
    maxLength: CONTACT_MESSAGE_LIMITS.messageMax,
  },
};
