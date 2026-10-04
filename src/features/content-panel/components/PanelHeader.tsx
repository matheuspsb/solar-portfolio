import { CloseIcon } from '@/design-system/atoms/CloseIcon';
import { IconButton } from '@/design-system/atoms/IconButton';
import { Label } from '@/design-system/atoms/Label';

type PanelHeaderProps = {
  label: string;
  onClose: () => void;
};

export function PanelHeader({ label, onClose }: PanelHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line-faint px-7 py-5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-ember-400 text-ember-400 shadow-dot"
        />
        <Label size="eyebrow">{label}</Label>
      </div>
      <IconButton label="Fechar painel" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </header>
  );
}
