const PROTOCOL_BASE = 1000;
const PROTOCOL_RANGE = 9000;
const PROTOCOL_NAME_WEIGHT = 397;
const PROTOCOL_MESSAGE_WEIGHT = 31;

export function getFirstName(name: string, fallback: string): string {
  return name.trim().split(/\s+/)[0] || fallback;
}

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
}

export function formatStampDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(2);
  return `${day}·${month}·${year}`;
}

export function buildProtocol(name: string, message: string): string {
  const seed = name.length * PROTOCOL_NAME_WEIGHT + message.length * PROTOCOL_MESSAGE_WEIGHT;
  return `MSG-${(seed % PROTOCOL_RANGE) + PROTOCOL_BASE}`;
}
