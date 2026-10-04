import { expect, it } from 'vitest';
import { joinClassNames } from './join-class-names';

it('joins truthy names with spaces', () => {
  expect(joinClassNames('first', 'second')).toBe('first second');
});

it('skips undefined, null, false and empty strings', () => {
  expect(joinClassNames('first', undefined, null, false, '', 'last')).toBe('first last');
});

it('returns an empty string when nothing is given', () => {
  expect(joinClassNames()).toBe('');
});
