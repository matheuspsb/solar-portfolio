// Use case: the floating hint and the keyboard buttons name bodies from the same config. The
// hint must reflect what the user is pointing at or focusing, and vanish while the panel is open
// or when the id refers to a body that no longer exists.
import { describe, expect, it } from 'vitest';
import { getBodyAccessibleLabel, getHintLabel } from './body-labels';
import type { LabeledBody } from './body-labels';

const bodies: LabeledBody[] = [
  { id: 'sun', name: 'Sol', menuLabel: 'Sobre' },
  { id: 'earth', name: 'Terra', menuLabel: 'Projetos' },
];

const idle = { hoveredId: null, focusedId: null, selectedId: null };

describe('getBodyAccessibleLabel', () => {
  it('names the body and what opening it shows', () => {
    expect(getBodyAccessibleLabel(bodies[0]!)).toBe('Sol: abrir seção Sobre');
  });
});

describe('getHintLabel', () => {
  it('is null when nothing is hovered or focused', () => {
    expect(getHintLabel(idle, bodies)).toBeNull();
  });

  it('describes the hovered body', () => {
    expect(getHintLabel({ ...idle, hoveredId: 'sun' }, bodies)).toBe('Sol · Sobre');
  });

  it('prefers the focused body over the hovered one', () => {
    expect(getHintLabel({ ...idle, hoveredId: 'sun', focusedId: 'earth' }, bodies)).toBe(
      'Terra · Projetos',
    );
  });

  it('is null while a body is selected (the panel is open)', () => {
    expect(
      getHintLabel({ hoveredId: 'sun', focusedId: 'sun', selectedId: 'sun' }, bodies),
    ).toBeNull();
  });

  it('is null for an unknown id', () => {
    expect(getHintLabel({ ...idle, hoveredId: 'pluto' }, bodies)).toBeNull();
  });

  it('is null for an empty list', () => {
    expect(getHintLabel({ ...idle, hoveredId: 'sun' }, [])).toBeNull();
  });
});
