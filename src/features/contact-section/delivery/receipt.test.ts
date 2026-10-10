import { describe, expect, it } from 'vitest';
import { buildProtocol, fillTemplate, formatStampDate, getFirstName } from './receipt';

describe('getFirstName', () => {
  it('takes the first word', () => {
    expect(getFirstName('Ana Souza', 'viajante')).toBe('Ana');
  });

  it('ignores surrounding and repeated spaces', () => {
    expect(getFirstName('   Ana    Souza ', 'viajante')).toBe('Ana');
  });

  it.each(['', '   '])('uses the fallback for the blank name %j', (name) => {
    expect(getFirstName(name, 'viajante')).toBe('viajante');
  });
});

describe('fillTemplate', () => {
  it('replaces every placeholder', () => {
    expect(fillTemplate('Oi {name}, {name}! {email}', { name: 'Ana', email: 'a@b.co' })).toBe(
      'Oi Ana, Ana! a@b.co',
    );
  });

  it('leaves unknown placeholders untouched', () => {
    expect(fillTemplate('Oi {missing}', {})).toBe('Oi {missing}');
  });

  it('does not interpret dollar signs in the values', () => {
    expect(fillTemplate('{name}', { name: '$& $1' })).toBe('$& $1');
  });
});

describe('formatStampDate', () => {
  it('formats as dd·mm·yy with zero padding', () => {
    expect(formatStampDate(new Date(2026, 0, 5))).toBe('05·01·26');
  });
});

describe('buildProtocol', () => {
  it('is MSG- followed by four digits', () => {
    expect(buildProtocol('Ana Souza', 'Oi')).toMatch(/^MSG-\d{4}$/);
  });

  it('changes with the message', () => {
    expect(buildProtocol('Ana', 'Oi')).not.toBe(buildProtocol('Ana', 'Oi, tudo bem?'));
  });

  it('stays within the four digits for long input', () => {
    expect(buildProtocol('a'.repeat(100), 'b'.repeat(500))).toMatch(/^MSG-\d{4}$/);
  });
});
