export type DeliveryConfig =
  | { mode: 'resend'; apiKey: string; from: string; to: string }
  | { mode: 'disabled' }
  | { mode: 'missing'; missing: string[] };

type Environment = Record<string, string | undefined>;

const REQUIRED_VARIABLES = ['RESEND_API_KEY', 'CONTACT_FROM_EMAIL', 'CONTACT_TO_EMAIL'] as const;
const DISABLED_VALUE = 'disabled';

export function readDeliveryConfig(environment: Environment): DeliveryConfig {
  if (environment.CONTACT_DELIVERY?.trim() === DISABLED_VALUE) return { mode: 'disabled' };

  const values = REQUIRED_VARIABLES.map((name) => environment[name]?.trim() ?? '');
  const missing = REQUIRED_VARIABLES.filter((_name, index) => values[index] === '');
  if (missing.length > 0) return { mode: 'missing', missing };

  const [apiKey = '', from = '', to = ''] = values;
  return { mode: 'resend', apiKey, from, to };
}
