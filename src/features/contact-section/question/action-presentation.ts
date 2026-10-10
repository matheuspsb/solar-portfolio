import type { ContactContent } from '@/domain/contact-content';

const CONTINUE_ICON = '→';
const SEND_ICON = '↗';
const SENDING_ICON = '✦';

type ActionPresentationInput = {
  isSending: boolean;
  isLastStep: boolean;
  actions: ContactContent['actions'];
};

export function getActionPresentation({ isSending, isLastStep, actions }: ActionPresentationInput) {
  if (isSending) return { label: actions.sendingLabel, icon: SENDING_ICON };
  if (isLastStep) return { label: actions.sendLabel, icon: SEND_ICON };
  return { label: actions.continueLabel, icon: CONTINUE_ICON };
}
