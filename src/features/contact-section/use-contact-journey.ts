import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useReducer, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { ContactContent } from '@/domain/contact-content';
import { contactMessageSchema, validateContactField } from '@/domain/contact-message';
import type { ContactMessage } from '@/domain/contact-message';
import { useContactSubmitter } from '@/hooks/contact-submitter';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import type { KeyValueStorage } from '@/lib/safe-storage';
import { EMPTY_CONTACT_MESSAGE } from './draft/contact-draft';
import { useContactDraft } from './draft/use-contact-draft';
import { UNEXPECTED_FAILURE, deliverSafely, readHoneypot } from './delivery/submit-message';
import { COMET_ENTRY_PROGRESS, COMET_EXIT_PROGRESS, STEP_PROGRESS } from './journey/arc-geometry';
import {
  COMET_ADVANCE_MS,
  COMET_ENTRY_MS,
  COMET_EXIT_MS,
  COMET_RETURN_EXTRA_STEP_MS,
  COMET_RETURN_MS,
} from './journey/comet-motion';
import { useComet } from './journey/use-comet';
import { getActionPresentation } from './question/action-presentation';
import { contactFlowReducer, createInitialFlowState } from './question/contact-flow';
import type { ContactStepIndex } from './question/contact-flow';
import type { ContactFormModel } from './question/contact-form-model';
import { INPUT_ATTRIBUTES } from './question/input-attributes';
import { fillTemplate, getFirstName } from './delivery/receipt';

const LAST_STEP: ContactStepIndex = 2;

export type Delivery = { message: ContactMessage; deliveredAt: Date };

type UseContactJourneyOptions = {
  content: ContactContent;
  frameScheduler?: FrameScheduler;
  getNow: () => Date;
  draftStorage: KeyValueStorage | null;
};

type StageModel = {
  planets: { label: string; jumpLabel: string }[];
  currentStep: ContactStepIndex;
  isSending: boolean;
  isDone: boolean;
  comet: ReturnType<typeof useComet>['position'];
  canJump: boolean;
  onJump: (index: number) => void;
};

export type ContactJourney = {
  delivered: Delivery | null;
  stage: StageModel;
  form: ContactFormModel;
  formRef: RefObject<HTMLFormElement | null>;
  onSendAnother: () => void;
};

export function useContactJourney({
  content,
  frameScheduler,
  getNow,
  draftStorage,
}: UseContactJourneyOptions): ContactJourney {
  const submitMessage = useContactSubmitter();
  const reducedMotion = usePrefersReducedMotion();
  const draft = useContactDraft({ storage: draftStorage, getNow });
  const [flow, dispatch] = useReducer(contactFlowReducer, draft.step, createInitialFlowState);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const isSendingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const noteId = useId();
  const comet = useComet({
    initialProgress: COMET_ENTRY_PROGRESS,
    entry: { target: STEP_PROGRESS[draft.step], durationMs: COMET_ENTRY_MS },
    reducedMotion,
    scheduler: frameScheduler,
  });
  const {
    register,
    control,
    getValues,
    handleSubmit: validateAndSubmit,
    reset,
  } = useForm<ContactMessage>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: draft.values,
  });

  const step = content.steps[flow.step];
  const answer = useWatch({ control, name: step.field }) ?? '';
  const typedName = useWatch({ control, name: 'name' }) ?? '';
  const isSending = flow.status === 'sending';
  const isDone = flow.status === 'done';
  const isLastStep = flow.step === LAST_STEP;
  const firstName = getFirstName(typedName, content.fallbackFirstName);
  const attributes = INPUT_ATTRIBUTES[step.field];
  const delivered = isDone ? delivery : null;

  const sendMessage = async (message: ContactMessage) => {
    isSendingRef.current = true;
    dispatch({ type: 'send' });
    const submission = {
      ...message,
      homepage: readHoneypot(formRef.current),
      elapsedMs: getNow().getTime() - draft.startedAt,
    };
    const [, result] = await Promise.all([
      comet.travelTo(COMET_EXIT_PROGRESS, COMET_EXIT_MS),
      deliverSafely(submitMessage, submission),
    ]);
    if (result.ok) {
      draft.clear();
      setDelivery({ message, deliveredAt: getNow() });
      dispatch({ type: 'delivered' });
    } else {
      dispatch({ type: 'failed', error: result.error });
      void comet.travelTo(STEP_PROGRESS[LAST_STEP], COMET_RETURN_MS, COMET_EXIT_PROGRESS);
    }
    isSendingRef.current = false;
  };

  const saveDraft = (draftStep: ContactStepIndex) => {
    draft.save(getValues(), draftStep);
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
      const nextStep = (flow.step + 1) as ContactStepIndex;
      dispatch({ type: 'advance' });
      saveDraft(nextStep);
      void comet.travelTo(STEP_PROGRESS[nextStep], COMET_ADVANCE_MS);
      return;
    }
    await validateAndSubmit(sendMessage, rejectInvalid)();
  };

  const goBackTo = (target: ContactStepIndex) => {
    const skippedSteps = flow.step - target - 1;
    const durationMs = COMET_RETURN_MS + skippedSteps * COMET_RETURN_EXTRA_STEP_MS;
    dispatch({ type: 'jump', step: target });
    saveDraft(target);
    void comet.travelTo(STEP_PROGRESS[target], durationMs);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitAnswer();
  };

  const handleMessageKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    void submitAnswer();
  };

  const handleChange = () => {
    dispatch({ type: 'edit' });
    saveDraft(flow.step);
  };

  const handleBack = () => {
    if (flow.step === 0) return;
    goBackTo((flow.step - 1) as ContactStepIndex);
  };

  const handleSendAnother = () => {
    draft.clear();
    reset(EMPTY_CONTACT_MESSAGE);
    setDelivery(null);
    dispatch({ type: 'reset' });
    void comet.travelTo(STEP_PROGRESS[0], COMET_ENTRY_MS, COMET_ENTRY_PROGRESS);
  };

  return {
    delivered,
    formRef,
    onSendAnother: handleSendAnother,
    stage: {
      planets: content.steps.map((planetStep) => ({
        label: planetStep.label,
        jumpLabel: fillTemplate(content.actions.jumpLabel, { label: planetStep.label }),
      })),
      currentStep: flow.step,
      isSending,
      isDone,
      comet: comet.position,
      canJump: flow.status === 'asking',
      onJump: (index) => goBackTo(index as ContactStepIndex),
    },
    form: {
      noteId,
      stepKey: String(flow.step),
      kicker: step.kicker,
      question: fillTemplate(step.question, { firstName }),
      placeholder: step.placeholder,
      attributes,
      registration: register(step.field),
      fieldMotion: flow.fieldMotion,
      answerLength: answer.length,
      hasValue: answer.trim().length > 0,
      isValid: validateContactField(step.field, answer) === null,
      hasError: flow.error !== null,
      note: flow.error ?? (isSending ? content.sendingNote : step.hint),
      action: getActionPresentation({ isSending, isLastStep, actions: content.actions }),
      isSending,
      canGoBack: flow.step > 0 && !isSending,
      onSubmit: handleFormSubmit,
      onChange: handleChange,
      onKeyDown: attributes.multiline ? handleMessageKeyDown : undefined,
      onBack: handleBack,
    },
  };
}
