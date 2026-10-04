// Use case: key facts (experience, location) sit side by side like telemetry cells. Each cell must
// pair its label with its value as a description list so screen readers read "Experiência: ~5 ...".
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataCell } from './DataCell';
import { DataGrid } from './DataGrid';

describe('DataGrid with DataCell', () => {
  it('pairs each label (term) with its content (definition)', () => {
    render(
      <DataGrid>
        <DataCell label="Experiência">Cerca de 5 anos</DataCell>
        <DataCell label="Localização">Campina Grande</DataCell>
      </DataGrid>,
    );
    const label = screen.getByText('Experiência');
    expect(label.tagName).toBe('DT');
    expect(label.nextElementSibling?.tagName).toBe('DD');
    expect(label.nextElementSibling).toHaveTextContent('Cerca de 5 anos');
    expect(screen.getByText('Localização').nextElementSibling).toHaveTextContent('Campina Grande');
  });

  it('is a description list', () => {
    const { container } = render(
      <DataGrid>
        <DataCell label="A">1</DataCell>
      </DataGrid>,
    );
    expect(container.querySelector('dl')).toBeInTheDocument();
  });

  it('keeps the cell order', () => {
    render(
      <DataGrid>
        <DataCell label="Primeiro">1</DataCell>
        <DataCell label="Segundo">2</DataCell>
      </DataGrid>,
    );
    const terms = screen.getAllByText(/Primeiro|Segundo/).map((term) => term.textContent);
    expect(terms).toEqual(['Primeiro', 'Segundo']);
  });

  it('renders an empty grid without crashing', () => {
    const { container } = render(<DataGrid>{null}</DataGrid>);
    expect(container.querySelector('dl')).toBeInTheDocument();
  });
});
