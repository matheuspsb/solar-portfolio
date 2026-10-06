import { describe, expect, it } from 'vitest';
import { MIN_FILL_MS, judgeSubmission } from './bot-guard';

const human = { homepage: '', elapsedMs: MIN_FILL_MS + 1000 };

describe('judgeSubmission', () => {
  it('lets a person through: hidden field empty, enough time spent', () => {
    expect(judgeSubmission(human)).toBe('human');
  });

  it('flags a filled hidden field, which only a script fills in', () => {
    expect(judgeSubmission({ ...human, homepage: 'http://spam.example' })).toBe('honeypot');
  });

  it('flags a hidden field filled with just a space too', () => {
    expect(judgeSubmission({ ...human, homepage: '   ' })).toBe('honeypot');
  });

  it('flags a submission faster than a person can answer three questions', () => {
    expect(judgeSubmission({ ...human, elapsedMs: MIN_FILL_MS - 1 })).toBe('too-fast');
  });

  it('accepts exactly the minimum time', () => {
    expect(judgeSubmission({ ...human, elapsedMs: MIN_FILL_MS })).toBe('human');
  });

  it('flags a negative time (a forged or broken clock)', () => {
    expect(judgeSubmission({ ...human, elapsedMs: -5 })).toBe('too-fast');
  });

  it('flags a request that skipped the form, so it carries no signals at all', () => {
    expect(judgeSubmission({})).toBe('missing-signals');
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, '5000', null, undefined])(
    'flags a time that is not a finite number (%s)',
    (elapsedMs) => {
      expect(judgeSubmission({ homepage: '', elapsedMs })).toBe('missing-signals');
    },
  );

  it('flags a hidden field that is not a string', () => {
    expect(judgeSubmission({ homepage: 42, elapsedMs: 10_000 })).toBe('missing-signals');
  });

  it.each([null, undefined, 'texto', 42, []])('never throws on the non-object %j', (input) => {
    expect(judgeSubmission(input)).toBe('missing-signals');
  });
});
