import { describe, expect, it } from 'vitest';
import {
  CONTACT_MESSAGE_LIMITS,
  contactMessageSchema,
  parseContactMessage,
} from './contact-message';

const valid = {
  name: 'Ana Souza',
  email: 'ana@empresa.com.br',
  message: 'Gostei do seu portfólio, vamos conversar?',
};

function errorFor(input: unknown, field: 'name' | 'email' | 'message'): string | undefined {
  const result = contactMessageSchema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
}

describe('contactMessageSchema', () => {
  it('accepts an ordinary message', () => {
    expect(contactMessageSchema.safeParse(valid).success).toBe(true);
  });

  it('trims surrounding whitespace from every field', () => {
    const result = contactMessageSchema.parse({
      name: '  Ana Souza  ',
      email: '  ana@empresa.com.br ',
      message: '\n  Gostei do seu portfólio!  \n',
    });
    expect(result).toEqual({
      name: 'Ana Souza',
      email: 'ana@empresa.com.br',
      message: 'Gostei do seu portfólio!',
    });
  });

  it('drops unknown fields instead of passing them along', () => {
    const result = contactMessageSchema.parse({ ...valid, role: 'admin' });
    expect(result).not.toHaveProperty('role');
  });

  describe('name', () => {
    it.each(['', '   '])('rejects an empty name %j with a clear message', (name) => {
      expect(errorFor({ ...valid, name }, 'name')).toBe('Informe seu nome.');
    });

    it('accepts names with accents, apostrophes and hyphens', () => {
      expect(contactMessageSchema.safeParse({ ...valid, name: "João D'Ávila-Silva" }).success).toBe(
        true,
      );
    });

    it('rejects a name over the limit and accepts exactly the limit', () => {
      const atLimit = 'a'.repeat(CONTACT_MESSAGE_LIMITS.nameMax);
      expect(contactMessageSchema.safeParse({ ...valid, name: atLimit }).success).toBe(true);
      expect(errorFor({ ...valid, name: atLimit + 'a' }, 'name')).toContain('no máximo');
    });
  });

  describe('email', () => {
    it.each(['', '   '])('asks for the e-mail when it is empty (%j)', (email) => {
      expect(errorFor({ ...valid, email }, 'email')).toBe('Informe seu e-mail.');
    });

    it.each(['ana', 'ana@', '@empresa.com', 'ana@empresa', 'ana empresa@x.com', 'ana@@x.com'])(
      'rejects the invalid e-mail %j',
      (email) => {
        expect(errorFor({ ...valid, email }, 'email')).toBe('Informe um e-mail válido.');
      },
    );

    it.each(['ana@empresa.com', 'ana.souza+vaga@empresa.com.br', 'a@b.co'])(
      'accepts the valid e-mail %j',
      (email) => {
        expect(contactMessageSchema.safeParse({ ...valid, email }).success).toBe(true);
      },
    );

    it('rejects an e-mail over the limit', () => {
      const tooLong = `${'a'.repeat(CONTACT_MESSAGE_LIMITS.emailMax)}@empresa.com`;
      expect(errorFor({ ...valid, email: tooLong }, 'email')).toBeDefined();
    });
  });

  describe('message', () => {
    it.each(['', '    '])('rejects an empty message %j', (message) => {
      expect(errorFor({ ...valid, message }, 'message')).toBe('Escreva uma mensagem.');
    });

    it('requires a minimum length and counts only trimmed characters', () => {
      const tooShort = 'a'.repeat(CONTACT_MESSAGE_LIMITS.messageMin - 1);
      expect(errorFor({ ...valid, message: `   ${tooShort}   ` }, 'message')).toContain(
        'pelo menos',
      );
      const atMinimum = 'a'.repeat(CONTACT_MESSAGE_LIMITS.messageMin);
      expect(contactMessageSchema.safeParse({ ...valid, message: atMinimum }).success).toBe(true);
    });

    it('rejects a message over the limit and accepts exactly the limit', () => {
      const atLimit = 'a'.repeat(CONTACT_MESSAGE_LIMITS.messageMax);
      expect(contactMessageSchema.safeParse({ ...valid, message: atLimit }).success).toBe(true);
      expect(errorFor({ ...valid, message: atLimit + 'a' }, 'message')).toContain('no máximo');
    });

    it('keeps line breaks inside the message', () => {
      const result = contactMessageSchema.parse({
        ...valid,
        message: 'Primeira linha\n\nSegunda linha',
      });
      expect(result.message).toBe('Primeira linha\n\nSegunda linha');
    });
  });

  describe('invalid shapes', () => {
    it.each([null, undefined, 'texto', 42, [], {}])('rejects the non-form input %j', (input) => {
      expect(contactMessageSchema.safeParse(input).success).toBe(false);
    });

    it('rejects non-string fields', () => {
      expect(contactMessageSchema.safeParse({ ...valid, name: 123 }).success).toBe(false);
    });
  });
});

describe('parseContactMessage', () => {
  it('returns the trimmed data for a valid input', () => {
    expect(parseContactMessage({ ...valid, name: ' Ana Souza ' })).toEqual({
      success: true,
      data: valid,
    });
  });

  it('returns one readable message per invalid field', () => {
    const result = parseContactMessage({ name: '', email: 'x', message: '' });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(['email', 'message', 'name']);
    expect(result.fieldErrors.name).toBe('Informe seu nome.');
  });

  it('never throws on garbage', () => {
    expect(() => parseContactMessage(undefined)).not.toThrow();
  });
});
