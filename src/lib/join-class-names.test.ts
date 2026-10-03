// Use case: components compose utility classes conditionally. A bug would leak "undefined"
// or "false" class names into the DOM or drop a required class.
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
