import type { ContactField } from './contact-message';

export type ContactStepContent = {
  field: ContactField;
  label: string;
  kicker: string;
  question: string;
  placeholder: string;
  hint: string;
};

export type ContactContent = {
  type: 'contact';
  fallbackFirstName: string;
  steps: readonly [ContactStepContent, ContactStepContent, ContactStepContent];
  actions: {
    continueLabel: string;
    sendLabel: string;
    sendingLabel: string;
    backLabel: string;
    sendAnotherLabel: string;
    jumpLabel: string;
  };
  sendingNote: string;
  honeypotLabel: string;
  linkedin: { text: string; label: string; href: string };
  delivered: {
    kicker: string;
    title: string;
    reply: string;
    senderLabel: string;
    originLabel: string;
    destinationLabel: string;
    stamp: { top: string; name: string; status: string };
  };
};
