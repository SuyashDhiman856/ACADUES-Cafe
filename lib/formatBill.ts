import type { SystemSettings } from '../types/systemSettings';

/** e.g. "INR 1,240" — avoids "INR0" from missing spaces */
export function formatBillCode(
  settings: SystemSettings,
  amount: number | undefined | null
): string {
  const code = settings.currency || 'INR';
  const n = amount ?? 0;
  return `${code} ${n.toLocaleString('en-IN')}`;
}

export function formatBillSymbol(
  settings: SystemSettings,
  amount: number | undefined | null
): string {
  const sym = settings.currencySymbol || '₹';
  const n = amount ?? 0;
  return `${sym} ${n.toLocaleString('en-IN')}`;
}
