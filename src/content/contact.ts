import type { ContactContent } from '@/lib/contact-content';

export const contactContent: ContactContent = {
  type: 'contact',
  fallbackFirstName: 'viajante',
  steps: [
    {
      field: 'name',
      label: 'NOME',
      kicker: '01 / 03',
      question: 'Oi! Como posso te chamar?',
      placeholder: 'Seu nome',
      hint: 'ou tecle Enter ↵',
    },
    {
      field: 'email',
      label: 'E-MAIL',
      kicker: '02 / 03',
      question: 'Prazer, {firstName}. Para onde envio a resposta?',
      placeholder: 'voce@email.com',
      hint: 'ou tecle Enter ↵',
    },
    {
      field: 'message',
      label: 'MENSAGEM',
      kicker: '03 / 03',
      question: 'Sobre o que você quer conversar?',
      placeholder: 'Uma ideia, uma oportunidade, um projeto...',
      hint: 'Ctrl + Enter para enviar',
    },
  ],
  actions: {
    continueLabel: 'Continuar',
    sendLabel: 'Enviar mensagem',
    sendingLabel: 'Transmitindo…',
    backLabel: 'Voltar',
    sendAnotherLabel: 'Enviar outra mensagem',
    jumpLabel: 'Voltar para {label}',
  },
  sendingNote: 'Transmitindo pelo arco…',
  linkedin: {
    text: 'Quer trocar uma ideia ou falar sobre uma oportunidade? Me chame pelo LinkedIn.',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/matheuspaulosouza',
  },
  delivered: {
    kicker: 'ENTREGUE · CORREIO DE HERMES',
    title: 'Hermes levou sua mensagem, {firstName}.',
    reply: 'Vou responder em {email}.',
    senderLabel: 'REMETENTE',
    originLabel: 'ORIGEM · VOCÊ',
    destinationLabel: 'MERCÚRIO',
    stamp: { top: 'CORREIO DE', name: 'HERMES', status: 'ENTREGUE' },
  },
};
