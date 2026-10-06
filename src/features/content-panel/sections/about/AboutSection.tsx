import type { AboutContent } from '@/lib/celestial-body';
import { formatBodyCount } from './format-count';
import { ArrowUpRightIcon } from '@/design-system/atoms/ArrowUpRightIcon';
import { Heading } from '@/design-system/atoms/Heading';
import { Label } from '@/design-system/atoms/Label';
import { Link } from '@/design-system/atoms/Link';
import { Text } from '@/design-system/atoms/Text';
import { DataCell } from './DataCell';
import { DataGrid } from './DataGrid';
import { OrbitEmblem } from './OrbitEmblem';
import { RuledHeading } from '../../components/RuledHeading';
import { StackList } from './StackList';

const STACK_LABEL = 'Stack principal';

type AboutSectionProps = {
  content: AboutContent;
  emblemTextureUrl: string | null;
};

export function AboutSection({ content, emblemTextureUrl }: AboutSectionProps) {
  const hasStack = content.stack.length > 0;
  const hasLinks = content.links.length > 0;
  const stackCount = formatBodyCount(content.stack.length);

  return (
    <div className="flex flex-col gap-6.5 p-7 pb-6">
      <div className="flex items-center gap-5">
        <OrbitEmblem textureUrl={emblemTextureUrl} />
        <div className="flex min-w-0 flex-col gap-1">
          <Heading level={2} size="display">
            {content.name}
          </Heading>
          <Label as="p" tone="accent" size="role">
            {content.role}
          </Label>
        </div>
      </div>

      <Text tone="secondary">{content.summary}</Text>

      <DataGrid>
        <DataCell label="Experiência">
          <div className="flex items-baseline gap-1.5">
            <span className="text-stat font-bold text-ember-400">{content.experience.value}</span>
            <span className="text-sm text-ink-200">{content.experience.unit}</span>
          </div>
          <Text size="caption" tone="muted">
            {content.experience.description}
          </Text>
        </DataCell>
        <DataCell label="Localização">
          <span className="text-body leading-snug font-medium">{content.location.name}</span>
          <span className="font-mono text-eyebrow text-nebula-300">
            {content.location.coordinates}
          </span>
        </DataCell>
      </DataGrid>

      {hasStack && (
        <section className="flex flex-col gap-3">
          <RuledHeading level={3} title={STACK_LABEL} trailing={stackCount} />
          <StackList label={STACK_LABEL} items={content.stack} />
        </section>
      )}

      {hasLinks && (
        <ul className="m-0 flex list-none flex-col items-start gap-2 p-0">
          {content.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} external variant="button">
                {link.label}
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
