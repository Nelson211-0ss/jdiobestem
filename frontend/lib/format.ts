/**
 * Numbers as people read them.
 *
 * A ledger showing `1500000` and one showing `1,500,000` hold the same value,
 * but only the second can be checked at a glance — and an expense report is
 * read far more often than it is typed. Grouping is applied wherever a number
 * is displayed.
 *
 * No currency symbol is inserted. Amounts here are per-record: an expense
 * carries its own Currency column, and a board column named "Budget (local
 * currency)" is deliberately not one currency at all. Guessing a symbol would
 * label a South Sudanese figure in dollars, which is worse than no symbol —
 * so the digits are grouped and the unit is left where it already is, in the
 * column heading or the neighbouring field.
 */

/** en-GB gives `1,234,567.89` — comma groups, dot decimal. */
const LOCALE = 'en-GB';

/** Does this field hold money? Decided by its name, which is all we have. */
export function isMoneyLabel(label: string): boolean {
  return /\b(amount|budget|salary|bonus|cost|price|fee|revenue|expense|value|raised|goal|pledge|donation|funding|balance|total|paid|payment|income)\b/i.test(
    label
  );
}

/**
 * A number from whatever the field holds.
 *
 * Board values arrive as strings, and a person typing into a grouped input
 * produces `1,250.50`. Both must come back as 1250.5. Returns null for
 * anything that is not a number, so callers can leave the original text alone
 * rather than printing `NaN`.
 */
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/,/g, '');
  if (cleaned === '') return null;
  // Guard against Number('') === 0 and Number('12px') === NaN alike.
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Group a number for display.
 *
 * Money always shows two decimals — `1,200` and `1,200.00` in the same column
 * make a total look wrong. Everything else keeps the precision it arrived
 * with, so a count stays a count.
 */
export function formatNumber(value: unknown, opts: { money?: boolean } = {}): string {
  const n = toNumber(value);
  if (n === null) return value === null || value === undefined ? '' : String(value);

  if (opts.money) {
    return n.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return n.toLocaleString(LOCALE, { maximumFractionDigits: 6 });
}

/** An amount with its currency, where the currency is actually known. */
export function formatMoney(value: unknown, currency?: string): string {
  const n = toNumber(value);
  if (n === null) return '';
  if (!currency) return formatNumber(n, { money: true });
  try {
    return n.toLocaleString(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    // An unknown or made-up currency code throws rather than falling back.
    return `${currency} ${formatNumber(n, { money: true })}`;
  }
}

/**
 * Group the digits of a partly-typed number.
 *
 * Called on every keystroke, so it must not fight the typist: a trailing `.`
 * and trailing zeros after it are the middle of typing `1.05`, and reformatting
 * them away would make the decimal point impossible to enter. The integer part
 * is grouped; whatever follows the point is left exactly as typed.
 */
export function groupWhileTyping(raw: string): string {
  const negative = raw.trim().startsWith('-');
  const digitsAndDot = raw.replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = digitsAndDot.split('.');
  const decimals = rest.join('');
  const grouped = whole === '' ? '' : Number(whole).toLocaleString(LOCALE);
  const sign = negative ? '-' : '';

  if (!digitsAndDot.includes('.')) return sign + grouped;
  return `${sign}${grouped}.${decimals}`;
}
