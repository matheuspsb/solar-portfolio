import type { ContactContent } from '@/lib/celestial-body';

export const contactContent: ContactContent = {
  type: 'contact',
  headline: 'Vamos conversar?',
  summary: 'Quer trocar uma ideia ou falar sobre uma oportunidade? Me chame pelo LinkedIn.',
  channels: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/matheuspaulosouza' }],
  form: {
    heading: 'Ou envie uma mensagem',
    nameLabel: 'Nome',
    emailLabel: 'E-mail',
    messageLabel: 'Mensagem',
    submitLabel: 'Enviar mensagem',
    submittingLabel: 'Enviando…',
    successMessage: 'Mensagem enviada. Obrigado pelo contato!',
  },
};
