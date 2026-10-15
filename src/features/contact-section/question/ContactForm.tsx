import type { RefObject } from 'react';
import { HONEYPOT_FIELD } from '@/domain/bot-guard';
import { CONTACT_MESSAGE_LIMITS } from '@/domain/contact-message';
import { AnswerField } from './AnswerField';
import { AnswerFooter } from './AnswerFooter';
import type { ContactFormModel } from './contact-form-model';
import { QuestionHeading } from './QuestionHeading';
import { StepActions } from './StepActions';

type ContactFormProps = {
  form: ContactFormModel;
  formRef: RefObject<HTMLFormElement | null>;
  honeypotLabel: string;
  backLabel: string;
};

export function ContactForm({ form, formRef, honeypotLabel, backLabel }: ContactFormProps) {
  const { attributes, fieldMotion } = form;
  const fieldMotionClass =
    fieldMotion.kind === 'shake'
      ? 'motion-safe:animate-field-shake'
      : 'motion-safe:animate-field-in';
  const count = attributes.multiline
    ? { current: form.answerLength, max: CONTACT_MESSAGE_LIMITS.messageMax }
    : undefined;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={form.onSubmit}
      onChange={form.onChange}
      onKeyDown={form.onKeyDown}
      className="flex flex-1 flex-col gap-6.5"
    >
      <QuestionHeading key={form.stepKey} kicker={form.kicker} text={form.question} />
      <div
        key={`${form.stepKey}-${fieldMotion.id}`}
        className={`flex flex-col gap-3 ${fieldMotionClass}`}
      >
        <AnswerField
          label={form.question}
          placeholder={form.placeholder}
          multiline={attributes.multiline}
          type={attributes.type}
          autoComplete={attributes.autoComplete}
          maxLength={attributes.maxLength}
          registration={form.registration}
          hasValue={form.hasValue}
          isValid={form.isValid}
          isInvalid={form.hasError}
          describedBy={form.noteId}
          focusOnMount={fieldMotion.id > 0}
        />
        <AnswerFooter
          noteId={form.noteId}
          note={form.note}
          hasError={form.hasError}
          count={count}
        />
      </div>
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none absolute size-px overflow-hidden opacity-0"
      >
        <label>
          {honeypotLabel}
          <input
            name={HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>
      <StepActions
        label={form.action.label}
        icon={form.action.icon}
        backLabel={backLabel}
        isReady={form.isValid}
        isSending={form.isSending}
        canGoBack={form.canGoBack}
        onBack={form.onBack}
      />
    </form>
  );
}
