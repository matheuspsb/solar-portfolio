import { describe, expect, it } from 'vitest';
import {
  CONTACT_MESSAGE_LIMITS,
  contactMessageSchema,
  parseContactMessage,
  validateContactField,
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
      expect(errorFor({ ...valid, name }, 'name')).toBeDefined();
    });

    it('asks for at least two characters, counting only trimmed ones', () => {
      expect(errorFor({ ...valid, name: ' A ' }, 'name')).toBeDefined();
      expect(validateContactField('name', 'A')).not.toBeNull();
      expect(contactMessageSchema.safeParse({ ...valid, name: ' Al ' }).success).toBe(true);
    });

    it('accepts names with accents, apostrophes and hyphens', () => {
      expect(contactMessageSchema.safeParse({ ...valid, name: "João D'Ávila-Silva" }).success).toBe(
        true,
      );
    });

    it('rejects a name over the limit and accepts exactly the limit', () => {
      const atLimit = 'a'.repeat(CONTACT_MESSAGE_LIMITS.nameMax);
      expect(contactMessageSchema.safeParse({ ...valid, name: atLimit }).success).toBe(true);
      expect(errorFor({ ...valid, name: atLimit + 'a' }, 'name')).toBeDefined();
    });
  });

  describe('email', () => {
    it.each(['', '   '])('asks for the e-mail when it is empty (%j)', (email) => {
      expect(errorFor({ ...valid, email }, 'email')).toBeDefined();
    });

    it.each(['ana', 'ana@', '@empresa.com', 'ana@empresa', 'ana empresa@x.com', 'ana@@x.com'])(
      'rejects the invalid e-mail %j',
      (email) => {
        expect(errorFor({ ...valid, email }, 'email')).toBeDefined();
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
      expect(errorFor({ ...valid, message }, 'message')).toBeDefined();
    });

    it('accepts a one-character message, counting only trimmed characters', () => {
      expect(contactMessageSchema.safeParse({ ...valid, message: '  a  ' }).success).toBe(true);
    });

    it('rejects a message over the limit and accepts exactly the limit', () => {
      const atLimit = 'a'.repeat(CONTACT_MESSAGE_LIMITS.messageMax);
      expect(contactMessageSchema.safeParse({ ...valid, message: atLimit }).success).toBe(true);
      expect(errorFor({ ...valid, message: atLimit + 'a' }, 'message')).toBeDefined();
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
    expect(result.fieldErrors.name).toBeDefined();
  });

  it('never throws on garbage', () => {
    expect(() => parseContactMessage(undefined)).not.toThrow();
  });
});

describe('validateContactField', () => {
  it('returns null for a valid value', () => {
    expect(validateContactField('name', 'Ana')).toBeNull();
    expect(validateContactField('email', 'ana@empresa.com')).toBeNull();
    expect(validateContactField('message', 'Oi!')).toBeNull();
  });

  it.each([
    ['name', '  '],
    ['email', 'ana@'],
    ['email', ''],
    ['message', ''],
  ] as const)('rejects the invalid %s %j', (field, value) => {
    expect(validateContactField(field, value)).not.toBeNull();
  });

  it.each([undefined, null, 42])('treats the non-string %j as invalid', (value) => {
    expect(validateContactField('name', value)).not.toBeNull();
  });
});
