import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useReducer, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { ContactContent } from '@/lib/contact-content';
import {
  CONTACT_MESSAGE_LIMITS,
  contactMessageSchema,
  validateContactField,
} from '@/lib/contact-message';
import type {
  ContactField,
  ContactMessage,
  ContactMessageSubmitter,
  ContactSubmitResult,
} from '@/lib/contact-message';
import { getActionPresentation } from './action-presentation';
import { AnswerFooter } from './AnswerFooter';
import { AnswerField } from './AnswerField';
import { ArcJourney } from './ArcJourney';
import { COMET_ENTRY_PROGRESS, COMET_EXIT_PROGRESS, STEP_PROGRESS } from './arc-geometry';
import {
  COMET_ADVANCE_MS,
  COMET_ENTRY_MS,
  COMET_EXIT_MS,
  COMET_RETURN_EXTRA_STEP_MS,
  COMET_RETURN_MS,
} from './comet-motion';
import { contactFlowReducer, createInitialFlowState } from './contact-flow';
import type { ContactStepIndex } from './contact-flow';
import { DeliveryReceipt } from './DeliveryReceipt';
import { DeliveryScene } from './DeliveryScene';
import { JourneyStage } from './JourneyStage';
import { LinkedInCard } from './LinkedInCard';
import { QuestionHeading } from './QuestionHeading';
import { buildProtocol, fillTemplate, formatStampDate, getFirstName } from './receipt';
import { StepActions } from './StepActions';
import { useComet } from './use-comet';
import type { FrameScheduler } from './use-comet';

const LAST_STEP: ContactStepIndex = 2;
const EMPTY_MESSAGE: ContactMessage = { name: '', email: '', message: '' };
const UNEXPECTED_FAILURE = 'Não foi possível enviar agora. Tente novamente em instantes.';

const INPUT_ATTRIBUTES: Record<
  ContactField,
  { type: 'text' | 'email'; autoComplete: string; multiline: boolean; maxLength: number }
> = {
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

type Delivery = { message: ContactMessage; deliveredAt: Date };

type ContactSectionProps = {
  content: ContactContent;
  onSubmitMessage: ContactMessageSubmitter;
  frameScheduler?: FrameScheduler;
  getNow?: () => Date;
};

async function deliverSafely(
  submit: ContactMessageSubmitter,
  message: ContactMessage,
): Promise<ContactSubmitResult> {
  try {
    return await submit(message);
  } catch {
    return { ok: false, error: UNEXPECTED_FAILURE };
  }
}

export function ContactSection({
  content,
  onSubmitMessage,
  frameScheduler,
  getNow = () => new Date(),
}: ContactSectionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [flow, dispatch] = useReducer(contactFlowReducer, undefined, createInitialFlowState);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const isSendingRef = useRef(false);
  const noteId = useId();
  const comet = useComet({
    initialProgress: COMET_ENTRY_PROGRESS,
    entry: { target: STEP_PROGRESS[0], durationMs: COMET_ENTRY_MS },
    reducedMotion,
    scheduler: frameScheduler,
  });
  const { register, control, getValues, handleSubmit, reset } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: EMPTY_MESSAGE,
  });

  const step = content.steps[flow.step];
  const answer = useWatch({ control, name: step.field }) ?? '';
  const typedName = useWatch({ control, name: 'name' }) ?? '';
  const isSending = flow.status === 'sending';
  const isDone = flow.status === 'done';
  const isLastStep = flow.step === LAST_STEP;
  const isValid = validateContactField(step.field, answer) === null;
  const firstName = getFirstName(typedName, content.fallbackFirstName);
  const question = fillTemplate(step.question, { firstName });
  const action = getActionPresentation({ isSending, isLastStep, actions: content.actions });
  const note = flow.error ?? (isSending ? content.sendingNote : step.hint);
  const attributes = INPUT_ATTRIBUTES[step.field];
  const fieldMotionClass =
    flow.fieldMotion.kind === 'shake'
      ? 'motion-safe:animate-field-shake'
      : 'motion-safe:animate-field-in';
  const planets = content.steps.map((planetStep) => ({
    label: planetStep.label,
    jumpLabel: fillTemplate(content.actions.jumpLabel, { label: planetStep.label }),
  }));

  const sendMessage = async (message: ContactMessage) => {
    isSendingRef.current = true;
    dispatch({ type: 'send' });
    const [, result] = await Promise.all([
      comet.travelTo(COMET_EXIT_PROGRESS, COMET_EXIT_MS),
      deliverSafely(onSubmitMessage, message),
    ]);
    if (result.ok) {
      setDelivery({ message, deliveredAt: getNow() });
      dispatch({ type: 'delivered' });
    } else {
      dispatch({ type: 'failed', error: result.error });
      void comet.travelTo(STEP_PROGRESS[LAST_STEP], COMET_RETURN_MS, COMET_EXIT_PROGRESS);
    }
    isSendingRef.current = false;
  };

  const rejectInvalid = () => {
    dispatch({
      type: 'reject',
      error: validateContactField(step.field, answer) ?? UNEXPECTED_FAILURE,
    });
  };

  const submitAnswer = async () => {
    if (flow.status !== 'asking' || isSendingRef.current) return;
    const error = validateContactField(step.field, getValues(step.field));
    if (error !== null) {
      dispatch({ type: 'reject', error });
      return;
    }
    if (!isLastStep) {
      dispatch({ type: 'advance' });
      void comet.travelTo(
        STEP_PROGRESS[flow.step + 1] ?? STEP_PROGRESS[LAST_STEP],
        COMET_ADVANCE_MS,
      );
      return;
    }
    await handleSubmit(sendMessage, rejectInvalid)();
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitAnswer();
  };

  const handleMessageKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    void submitAnswer();
  };

  const goBackTo = (target: ContactStepIndex) => {
    const skippedSteps = flow.step - target - 1;
    const durationMs = COMET_RETURN_MS + skippedSteps * COMET_RETURN_EXTRA_STEP_MS;
    dispatch({ type: 'jump', step: target });
    void comet.travelTo(STEP_PROGRESS[target], durationMs);
  };

  const handleBack = () => {
    if (flow.step === 0) return;
    goBackTo((flow.step - 1) as ContactStepIndex);
  };

  const handleSendAnother = () => {
    reset(EMPTY_MESSAGE);
    setDelivery(null);
    dispatch({ type: 'reset' });
    void comet.travelTo(STEP_PROGRESS[0], COMET_ENTRY_MS, COMET_ENTRY_PROGRESS);
  };

  return (
    <div className="flex flex-1 flex-col">
      <JourneyStage isDelivered={isDone}>
        {isDone && delivery ? (
          <DeliveryScene
            delivered={content.delivered}
            dateLabel={formatStampDate(delivery.deliveredAt)}
            reducedMotion={reducedMotion}
          />
        ) : (
          <ArcJourney
            planets={planets}
            currentStep={flow.step}
            isDelivered={isDone}
            isSending={isSending}
            reducedMotion={reducedMotion}
            head={comet.head}
            tail={comet.tail}
            canJump={flow.status === 'asking'}
            onJump={(index) => goBackTo(index as ContactStepIndex)}
          />
        )}
      </JourneyStage>

      <div className="flex flex-1 flex-col gap-5 px-7 pt-8 pb-7">
        {isDone && delivery ? (
          <DeliveryReceipt
            content={content}
            message={delivery.message}
            protocol={buildProtocol(delivery.message.name, delivery.message.message)}
            onSendAnother={handleSendAnother}
          />
        ) : (
          <>
            <form
              noValidate
              onSubmit={handleFormSubmit}
              onChange={() => dispatch({ type: 'edit' })}
              onKeyDown={attributes.multiline ? handleMessageKeyDown : undefined}
              className="flex flex-1 flex-col gap-6.5"
            >
              <QuestionHeading key={flow.step} kicker={step.kicker} text={question} />
              <div
                key={`${flow.step}-${flow.fieldMotion.id}`}
                className={`flex flex-col gap-3 ${fieldMotionClass}`}
              >
                <AnswerField
                  label={question}
                  placeholder={step.placeholder}
                  multiline={attributes.multiline}
                  type={attributes.type}
                  autoComplete={attributes.autoComplete}
                  maxLength={attributes.maxLength}
                  registration={register(step.field)}
                  hasValue={answer.trim().length > 0}
                  isValid={isValid}
                  isInvalid={flow.error !== null}
                  describedBy={noteId}
                  focusOnMount={flow.fieldMotion.id > 0}
                />
                <AnswerFooter
                  noteId={noteId}
                  note={note}
                  hasError={flow.error !== null}
                  count={
                    attributes.multiline
                      ? { current: answer.length, max: CONTACT_MESSAGE_LIMITS.messageMax }
                      : undefined
                  }
                />
              </div>
              <StepActions
                label={action.label}
                icon={action.icon}
                backLabel={content.actions.backLabel}
                isReady={isValid}
                isSending={isSending}
                canGoBack={flow.step > 0 && !isSending}
                onBack={handleBack}
              />
            </form>
            <LinkedInCard linkedin={content.linkedin} />
          </>
        )}
      </div>
    </div>
  );
}
