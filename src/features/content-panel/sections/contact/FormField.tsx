import { useId } from 'react';
import type { ReactNode } from 'react';
import { Label } from '@/design-system/atoms/Label';

type ControlProps = {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string | undefined;
};

type FormFieldProps = {
  label: string;
  error?: string;
  /** Receives the attributes that tie the control to its label and error. */
  children: (controlProps: ControlProps) => ReactNode;
};

export function FormField({ label, error, children }: FormFieldProps) {
  const controlId = useId();
  const errorId = `${controlId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2">
      <Label as="span" size="label">
        <label htmlFor={controlId}>{label}</label>
      </Label>
      {children({
        id: controlId,
        'aria-invalid': hasError,
        'aria-describedby': hasError ? errorId : undefined,
      })}
      {hasError && (
        <p id={errorId} className="m-0 text-xs text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}
