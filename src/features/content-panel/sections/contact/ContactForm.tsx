import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/design-system/atoms/Button';
import { Input } from '@/design-system/atoms/Input';
import { Text } from '@/design-system/atoms/Text';
import { Textarea } from '@/design-system/atoms/Textarea';
import type { ContactFormContent } from '@/lib/celestial-body';
import { contactMessageSchema } from '@/lib/contact-message';
import type { ContactMessage, ContactMessageSubmitter } from '@/lib/contact-message';
import { FormField } from './FormField';

type ContactFormProps = {
  content: ContactFormContent;
  onSubmit: ContactMessageSubmitter;
};

type Outcome = { status: 'idle' } | { status: 'sent' } | { status: 'failed'; error: string };

const IDLE: Outcome = { status: 'idle' };
const UNEXPECTED_FAILURE = 'Não foi possível enviar agora. Tente novamente em instantes.';

export function ContactForm({ content, onSubmit }: ContactFormProps) {
  const [outcome, setOutcome] = useState<Outcome>(IDLE);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', message: '' },
  });

  async function sendMessage(message: ContactMessage) {
    try {
      const result = await onSubmit(message);
      if (!result.ok) {
        setOutcome({ status: 'failed', error: result.error });
        return;
      }
      reset();
      setOutcome({ status: 'sent' });
    } catch {
      setOutcome({ status: 'failed', error: UNEXPECTED_FAILURE });
    }
  }

  const submitLabel = isSubmitting ? content.submittingLabel : content.submitLabel;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(sendMessage)}
      onChange={() => setOutcome(IDLE)}
      className="flex flex-col gap-5"
    >
      <FormField label={content.nameLabel} error={errors.name?.message}>
        {(controlProps) => (
          <Input type="text" autoComplete="name" {...controlProps} {...register('name')} />
        )}
      </FormField>
      <FormField label={content.emailLabel} error={errors.email?.message}>
        {(controlProps) => (
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            {...controlProps}
            {...register('email')}
          />
        )}
      </FormField>
      <FormField label={content.messageLabel} error={errors.message?.message}>
        {(controlProps) => <Textarea rows={5} {...controlProps} {...register('message')} />}
      </FormField>
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {submitLabel}
      </Button>
      {outcome.status === 'sent' && (
        <Text role="status" className="text-ember-300">
          {content.successMessage}
        </Text>
      )}
      {outcome.status === 'failed' && (
        <Text role="alert" className="text-danger-400">
          {outcome.error}
        </Text>
      )}
    </form>
  );
}
