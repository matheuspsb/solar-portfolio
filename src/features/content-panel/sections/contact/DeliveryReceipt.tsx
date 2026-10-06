import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/design-system/atoms/Button';
import { Heading } from '@/design-system/atoms/Heading';
import { Label } from '@/design-system/atoms/Label';
import { Text } from '@/design-system/atoms/Text';
import type { ContactContent } from '@/lib/contact-content';
import type { ContactMessage } from '@/lib/contact-message';
import { fillTemplate, getFirstName } from './receipt';

const KICKER_DELAY_SECONDS = 2.6;
const TITLE_DELAY_SECONDS = 2.7;
const REPLY_DELAY_SECONDS = 2.8;
const RECEIPT_DELAY_SECONDS = 2.95;
const ACTION_DELAY_SECONDS = 3.1;

type DeliveryReceiptProps = {
  content: ContactContent;
  message: ContactMessage;
  protocol: string;
  onSendAnother: () => void;
};

type AnimationDelayStyle = CSSProperties & { '--animation-delay': string };

function delayed(seconds: number): AnimationDelayStyle {
  return { '--animation-delay': `${seconds}s` };
}

export function DeliveryReceipt({
  content,
  message,
  protocol,
  onSendAnother,
}: DeliveryReceiptProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { delivered, actions, fallbackFirstName } = content;
  const firstName = getFirstName(message.name, fallbackFirstName);
  const title = fillTemplate(delivered.title, { firstName });
  const reply = fillTemplate(delivered.reply, { email: message.email });

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-3.5">
      <Label
        as="p"
        tone="accent"
        size="eyebrow"
        className="motion-safe:animate-fade-up"
        style={delayed(KICKER_DELAY_SECONDS)}
      >
        {delivered.kicker}
      </Label>
      <Heading
        ref={headingRef}
        level={2}
        size="question"
        tabIndex={-1}
        className="text-pretty outline-none motion-safe:animate-fade-up"
        style={delayed(TITLE_DELAY_SECONDS)}
      >
        {title}
      </Heading>
      <Text className="motion-safe:animate-fade-up" style={delayed(REPLY_DELAY_SECONDS)}>
        {reply}
      </Text>
      <div
        className="mt-1.5 flex flex-col gap-2 rounded-block border border-dashed border-line-chip px-4 py-3.5 motion-safe:animate-fade-up"
        style={delayed(RECEIPT_DELAY_SECONDS)}
      >
        <div className="flex justify-between gap-3 font-mono text-label tracking-code text-ink-400">
          <span>
            {delivered.senderLabel} · {message.name}
          </span>
          <span>{protocol}</span>
        </div>
        <p className="m-0 line-clamp-2 text-sm text-ink-300">“{message.message}”</p>
      </div>
      <Button
        variant="secondary"
        onClick={onSendAnother}
        className="mt-2 self-start text-ember-400 motion-safe:animate-fade-up"
        style={delayed(ACTION_DELAY_SECONDS)}
      >
        {actions.sendAnotherLabel}
      </Button>
    </div>
  );
}
