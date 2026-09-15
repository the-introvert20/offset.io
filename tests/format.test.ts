import { describe, it, expect } from 'vitest';
import { formatCurrency, formatMonthlyDelta, formatKg, formatTonnes, currencySymbol } from '@/lib/format';

describe('formatCurrency', () => {
  it('formats amounts per profile currency', () => {
    expect(formatCurrency(1500, 'INR')).toBe('₹1,500');
    expect(formatCurrency(1500, 'USD')).toBe('$1,500');
    expect(formatCurrency(1500, 'EUR')).toBe('€1,500');
    expect(formatCurrency(1500, 'GBP')).toBe('£1,500');
  });

  it('keeps the sign outside the symbol for deltas', () => {
    expect(formatCurrency(-20, 'USD')).toBe('-$20');
    expect(formatCurrency(0, 'INR')).toBe('₹0');
  });

  it('falls back to $ for missing or unknown codes', () => {
    expect(formatCurrency(100)).toBe('$100');
    expect(formatCurrency(100, 'XXX')).toBe('$100');
    expect(currencySymbol(null)).toBe('$');
  });
});

describe('formatMonthlyDelta', () => {
  it('renders signed monthly deltas', () => {
    expect(formatMonthlyDelta(45, 'INR')).toBe('+₹45/mo');
    expect(formatMonthlyDelta(-15, 'USD')).toBe('−$15/mo');
    expect(formatMonthlyDelta(0, 'EUR')).toBe('€0');
  });
});

describe('formatKg / formatTonnes', () => {
  it('formats masses for display', () => {
    expect(formatKg(4819.4)).toBe('4,819 kg');
    expect(formatTonnes(4820)).toBe('4.82 t');
  });
});
