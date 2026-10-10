export type LabeledBody = {
  id: string;
  name: string;
  menuLabel: string;
};

export function getBodyAccessibleLabel(body: LabeledBody): string {
  return `${body.name}: abrir seção ${body.menuLabel}`;
}
