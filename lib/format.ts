/**
 * Central currency + number formatting for offset.io.
 * All money shown in the UI must go through formatCurrency so the
 * user's profile currency (USD / EUR / GBP / INR) is respected.
 * No page should hardcode ₹ or $.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_SYMBOLS);

/** Returns the symbol for a currency code, falling back to $. */
export function currencySymbol(code?: string | null): string {
  if (code && CURRENCY_SYMBOLS[code]) return CURRENCY_SYMBOLS[code];
  return '$';
}

/**
 * Formats a monthly-or-any money amount, e.g. formatCurrency(1500, 'INR') → "₹1,500".
 * Keeps the sign in front of the symbol for deltas: formatCurrency(-20, 'USD') → "-$20".
 */
export function formatCurrency(amount: number, code?: string | null): string {
  const symbol = currencySymbol(code);
  const abs = Math.abs(amount).toLocaleString('en-US');
  return amount < 0 ? `-${symbol}${abs}` : `${symbol}${abs}`;
}

/** Formats a signed monthly delta, e.g. "+₹45/mo", "−$20/mo", "$0". */
export function formatMonthlyDelta(amount: number, code?: string | null): string {
  if (amount === 0) return `${currencySymbol(code)}0`;
  const formatted = formatCurrency(Math.abs(amount), code);
  return amount > 0 ? `+${formatted}/mo` : `−${formatted}/mo`;
}

/** Formats kilograms with thousands separators, e.g. "4,819 kg". */
export function formatKg(kg: number): string {
  return `${Math.round(kg).toLocaleString('en-US')} kg`;
}

/** Converts annual kg to a tonne string, e.g. 4820 → "4.82 t". */
export function formatTonnes(annualKg: number): string {
  return `${(annualKg / 1000).toFixed(2)} t`;
}
