type BodyHintProps = {
  label: string | null;
};

export function BodyHint({ label }: BodyHintProps) {
  if (label === null) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-8 left-1/2 z-(--z-chrome) -translate-x-1/2 rounded-pill border border-ember-400/55 bg-surface px-5 py-2 text-body font-medium text-ink-100 shadow-glow backdrop-blur-sm"
    >
      {label}
    </div>
  );
}
