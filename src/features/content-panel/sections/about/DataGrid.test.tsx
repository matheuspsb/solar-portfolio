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
});
