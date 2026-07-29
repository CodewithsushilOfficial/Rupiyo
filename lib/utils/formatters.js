import { format, parseISO } from 'date-fns';

/**
 * Formats a number as INR Currency (₹).
 * Example: 254650 -> ₹2,54,650.00
 */
export function formatCurrency(amount, compact = false) {
  const num = Number(amount || 0);
  if (compact && Math.abs(num) >= 100000) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(num / 100000).toFixed(2)} L`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats compact numbers for chart axes.
 * Example: 200000 -> ₹200K
 */
export function formatCompactCurrency(amount) {
  const num = Number(amount || 0);
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 1000).toFixed(0)}K`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(0)}K`;
  }
  return `₹${num}`;
}

/**
 * Formats percentage with sign.
 * Example: 12.5 -> 12.5%
 */
export function formatPercentage(value) {
  const num = Number(value || 0);
  return `${num > 0 ? '' : ''}${num.toFixed(1)}%`;
}

/**
 * Formats date string into readable format.
 * Example: '2026-05-20' -> 'May 20, 2026'
 */
export function formatTransactionDate(dateStr) {
  if (!dateStr) return '';
  try {
    const today = new Date().toISOString().substring(0, 10);
    if (dateStr === today) return 'Today';
    const date = parseISO(dateStr);
    return format(date, 'MMM d, yyyy');
  } catch (err) {
    return dateStr;
  }
}
