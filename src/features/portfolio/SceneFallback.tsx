import { Button } from '@/design-system/atoms/Button';
import { Heading } from '@/design-system/atoms/Heading';
import { Text } from '@/design-system/atoms/Text';

type SceneFallbackProps = {
  title: string;
  message: string;
  items: ReadonlyArray<{ id: string; label: string }>;
  onSelectItem: (id: string) => void;
  onRetry?: () => void;
};

export function SceneFallback({
  title,
  message,
  items,
  onSelectItem,
  onRetry,
}: SceneFallbackProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-line bg-surface p-6 text-center shadow-glow">
        <Heading level={2} size="xl">
          {title}
        </Heading>
        <Text role="status" tone="secondary">
          {message}
        </Text>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item) => (
            <Button key={item.id} onClick={() => onSelectItem(item.id)}>
              Abrir {item.label}
            </Button>
          ))}
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
