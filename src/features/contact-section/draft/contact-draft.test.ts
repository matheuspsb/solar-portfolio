import { describe, expect, it } from 'vitest';
import { CONTACT_MESSAGE_LIMITS } from '@/domain/contact-message';
import {
  CONTACT_DRAFT_TTL_MS,
  hasAnyAnswer,
  parseContactDraft,
  serializeContactDraft,
} from './contact-draft';
import type { ContactDraft } from './contact-draft';

const NOW = new Date(2026, 9, 13, 12).getTime();

function buildDraft(overrides: Partial<ContactDraft> = {}): ContactDraft {
  return {
    version: 1,
    savedAt: NOW - 60_000,
    startedAt: NOW - 120_000,
    step: 1,
    values: { name: 'Ana Souza', email: 'ana@empresa', message: '' },
    ...overrides,
  };
}

const parse = (draft: unknown, now = NOW) => parseContactDraft(JSON.stringify(draft), now);

describe('parseContactDraft', () => {
  it('reads back what was saved', () => {
    const { version, ...fields } = buildDraft();
    expect(parseContactDraft(serializeContactDraft(fields), NOW)).toEqual({ version, ...fields });
  });

  it.each([null, '', 'not json', '{', '42', '"text"', 'null', '[]'])(
    'ignores storage content that is not a draft (%s)',
    (raw) => {
      expect(parseContactDraft(raw, NOW)).toBeNull();
    },
  );

  it('ignores a draft from another format version', () => {
    expect(parse({ ...buildDraft(), version: 2 })).toBeNull();
  });

  it('ignores a draft with a missing or non-text answer', () => {
    expect(parse({ ...buildDraft(), values: { name: 'Ana', email: 'a@b.co' } })).toBeNull();
    expect(parse({ ...buildDraft(), values: { name: 7, email: '', message: '' } })).toBeNull();
  });

  it('ignores a draft with an answer longer than the form accepts', () => {
    const tooLong = 'x'.repeat(CONTACT_MESSAGE_LIMITS.messageMax + 1);
    expect(parse(buildDraft({ values: { name: 'Ana', email: '', message: tooLong } }))).toBeNull();
  });

  it.each([-1, 3, 1.5, Number.NaN])('ignores a draft with step %s', (step) => {
    expect(parse({ ...buildDraft(), step })).toBeNull();
  });

  it('ignores a draft whose times are not real numbers', () => {
    expect(parse({ ...buildDraft(), savedAt: 'yesterday' })).toBeNull();
    expect(parse({ ...buildDraft(), startedAt: null })).toBeNull();
  });

  it('forgets a draft older than its time to live, and keeps one just inside it', () => {
    expect(parse(buildDraft({ savedAt: NOW - CONTACT_DRAFT_TTL_MS - 1 }))).toBeNull();
    expect(parse(buildDraft({ savedAt: NOW - CONTACT_DRAFT_TTL_MS + 1 }))).not.toBeNull();
  });

  it('keeps a draft saved "in the future" after the clock was moved back', () => {
    expect(parse(buildDraft({ savedAt: NOW + 3_600_000 }))).not.toBeNull();
  });
});

describe('hasAnyAnswer', () => {
  it('is false when every answer is blank or only spaces', () => {
    expect(hasAnyAnswer({ name: '', email: '  ', message: '\n' })).toBe(false);
  });

  it('is true as soon as one answer has text', () => {
    expect(hasAnyAnswer({ name: '', email: '', message: 'Oi' })).toBe(true);
  });
});
