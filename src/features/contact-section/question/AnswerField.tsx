import { useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { joinClassNames } from '@/lib/join-class-names';
import { getUnderlinePercent } from './answer-progress';

type AnswerFieldProps = {
  label: string;
  placeholder: string;
  multiline: boolean;
  type: 'text' | 'email';
  autoComplete: string;
  maxLength: number;
  registration: UseFormRegisterReturn;
  hasValue: boolean;
  isValid: boolean;
  isInvalid: boolean;
  describedBy: string;
  focusOnMount: boolean;
};

const sharedControlClasses =
  'block w-full border-none bg-transparent text-ink-100 outline-none placeholder:text-ink-400';

export function AnswerField({
  label,
  placeholder,
  multiline,
  type,
  autoComplete,
  maxLength,
  registration,
  hasValue,
  isValid,
  isInvalid,
  describedBy,
  focusOnMount,
}: AnswerFieldProps) {
  const controlId = useId();
  const controlRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const underlinePercent = getUnderlinePercent({ hasValue, isFocused, isValid });

  useEffect(() => {
    if (focusOnMount) controlRef.current?.focus();
  }, [focusOnMount]);

  const attachControl = (element: HTMLInputElement | HTMLTextAreaElement | null) => {
    controlRef.current = element;
    registration.ref(element);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    void registration.onBlur(event);
  };

  const sharedProps = {
    id: controlId,
    name: registration.name,
    onChange: registration.onChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    autoComplete,
    maxLength,
    'aria-invalid': isInvalid,
    'aria-describedby': describedBy,
  };

  return (
    <div className="group relative">
      <label htmlFor={controlId} className="sr-only">
        {label}
      </label>
      {multiline ? (
        <textarea
          ref={attachControl}
          {...sharedProps}
          className={joinClassNames(
            sharedControlClasses,
            'h-(--size-message-field) resize-none py-1 text-message',
          )}
        />
      ) : (
        <input
          ref={attachControl}
          type={type}
          {...sharedProps}
          className={joinClassNames(sharedControlClasses, 'h-14 pr-10 text-answer')}
        />
      )}
      <span
        aria-hidden="true"
        className="block h-px bg-line-chip transition-colors duration-base group-focus-within:bg-ink-400"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-nebula-300 to-ember-400 shadow-ember-bar transition-[width] duration-slow ease-orbit-ring"
        style={{ width: `${underlinePercent}%` }}
      />
      {isValid && type === 'email' && (
        <span
          aria-hidden="true"
          className="absolute top-4 right-0.5 flex size-6 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--color-ember-300),var(--color-ember-400)_55%,var(--color-ember-700))] text-xs font-bold text-on-ember shadow-ember-planet motion-safe:animate-pop"
        >
          ✓
        </span>
      )}
    </div>
  );
}
