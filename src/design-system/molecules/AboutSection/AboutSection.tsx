import type { AboutContent } from '@/lib/celestial-body';
import { Heading } from '../../atoms/Heading/Heading';
import { Link } from '../../atoms/Link/Link';
import { Text } from '../../atoms/Text/Text';
import { StackList } from '../StackList/StackList';

const STACK_LABEL = 'Stack principal';

type AboutSectionProps = {
  content: AboutContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  const hasFacts = content.facts.length > 0;
  const hasStack = content.stack.length > 0;
  const hasLinks = content.links.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={3} size="xl">
          {content.name}
        </Heading>
        <Text tone="secondary">{content.role}</Text>
      </div>

      <Text>{content.summary}</Text>

      {hasFacts && (
        <dl className="m-0 flex flex-col gap-3">
          {content.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col">
              <dt className="text-sm font-semibold tracking-wide text-sun-300 uppercase">
                {fact.label}
              </dt>
              <dd className="m-0 text-text-primary">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {hasStack && (
        <section className="flex flex-col gap-3">
          <Heading level={3} size="md">
            {STACK_LABEL}
          </Heading>
          <StackList label={STACK_LABEL} items={content.stack} />
        </section>
      )}

      {hasLinks && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {content.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} external>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
