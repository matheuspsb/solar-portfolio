import { Button } from '@/components/Button';

type StepActionsProps = {
  label: string;
  icon: string;
  backLabel: string;
  isReady: boolean;
  isSending: boolean;
  canGoBack: boolean;
  onBack: () => void;
};

export function StepActions({
  label,
  icon,
  backLabel,
  isReady,
  isSending,
  canGoBack,
  onBack,
}: StepActionsProps) {
  return (
    <div className="flex items-center gap-3.5">
      <Button
        type="submit"
        variant={isReady ? 'primary' : 'muted'}
        aria-disabled={isSending}
        className="h-12.5 text-action"
      >
        {label}
        <span aria-hidden="true">{icon}</span>
      </Button>
      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          className="ml-auto cursor-pointer px-1 py-2 text-sm text-ink-300 transition-colors duration-fast hover:text-ink-100"
        >
          <span aria-hidden="true">← </span>
          {backLabel}
        </button>
      )}
    </div>
  );
}
