// Use case: the document outline must be correct for assistive tech. If level mapping broke,
// the panel title could be announced at the wrong level.
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Heading } from './Heading';

it.each([1, 2, 3, 4, 5, 6] as const)('renders level %i as a real heading', (level) => {
  render(<Heading level={level}>Título</Heading>);
  expect(screen.getByRole('heading', { level, name: 'Título' })).toBeInTheDocument();
});

it('lets the visual size differ from the semantic level', () => {
  render(
    <Heading level={2} size="xl">
      Sobre
    </Heading>,
  );
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
});

it('forwards native props such as id', () => {
  render(
    <Heading level={2} id="panel-title">
      Sobre
    </Heading>,
  );
  expect(screen.getByRole('heading')).toHaveAttribute('id', 'panel-title');
});
