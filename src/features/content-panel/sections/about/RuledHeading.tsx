import { Label } from '@/design-system/atoms/Label';

type RuledHeadingProps = {
  level: 2 | 3 | 4;
  title: string;
  trailing?: string;
};

const headingByLevel = { 2: 'h2', 3: 'h3', 4: 'h4' } as const;

/** Section title followed by a hairline rule and an optional note: "STACK PRINCIPAL ──── 6 CORPOS". */
export function RuledHeading({ level, title, trailing }: RuledHeadingProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Label as={headingByLevel[level]}>{title}</Label>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      {trailing && <Label tone="faint">{trailing}</Label>}
    </div>
  );
}
