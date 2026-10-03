import { Heading } from '../../atoms/Heading/Heading';
import { IconButton } from '../../atoms/IconButton/IconButton';

type PanelHeaderProps = {
  titleId: string;
  title: string;
  onClose: () => void;
};

export function PanelHeader({ titleId, title, onClose }: PanelHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
      <Heading level={2} size="xl" id={titleId}>
        {title}
      </Heading>
      <IconButton label="Fechar painel" onClick={onClose}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </IconButton>
    </header>
  );
}
