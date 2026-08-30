/**
 * What counts as a valid value, decided once.
 *
 * The rules are not written here — they are read from
 * `contract.generated.json`, which `python manage.py dump_form_contract`
 * produces by reading the serializers. So the browser refuses exactly what the
 * server would refuse, and a field made optional in Django stops being starred
 * in the dashboard without anyone remembering to come here.
 *
 * This is courtesy, not security. The serializer still validates every
 * request; this only means the person filling the form finds out beside the
 * field instead of after a round trip.
 */

import contract from '@/lib/admin/contract.generated.json';

export type FieldSpec = {
  required?: boolean;
  allowNull?: boolean;
  kind?: 'text' | 'email' | 'url' | 'slug' | 'number' | 'boolean' | 'date' | 'datetime' | 'choice';
  maxLength?: number;
  minLength?: number;
  maxValue?: number;
  minValue?: number;
  integer?: boolean;
  decimals?: number;
  choices?: string[];
};

type Contract = {
  admin: Record<string, Record<string, FieldSpec>>;
  public: Record<string, Record<string, FieldSpec>>;
};

const CONTRACT = contract as Contract;

/** The rules for one field, or an empty spec if the server has none. */
export function specFor(
  scope: 'admin' | 'public',
  resource: string,
  field: string
): FieldSpec {
  return CONTRACT[scope]?.[resource]?.[field] ?? {};
}

/** Every field the server requires for this resource. */
export function requiredFields(scope: 'admin' | 'public', resource: string): string[] {
  const group = CONTRACT[scope]?.[resource] ?? {};
  return Object.entries(group)
    .filter(([, spec]) => spec.required)
    .map(([name]) => name);
}

// Deliberately permissive. A validator stricter than reality rejects real
// addresses — apostrophes, plus-addressing, long new TLDs — and the person it
// turns away is a volunteer we then never hear from. This catches the typo
// (missing @, missing dot, a stray space) and lets the delivery attempt be the
// real test.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;
const SLUG = /^[-a-z0-9_]+$/;
// A phone number after the country code is picked: digits, and the separators
// people actually type between them.
const PHONE = /^[\d\s()+-]{6,20}$/;

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Check one value. Returns a message to show, or '' when it is fine.
 *
 * `label` is used in the message because "Excerpt is required" is actionable
 * on a form of twenty fields and "This field is required" is not.
 */
export function validateValue(spec: FieldSpec, value: unknown, label: string): string {
  if (isEmpty(value)) {
    // A false checkbox is a legitimate answer, not a blank.
    if (spec.required && spec.kind !== 'boolean') return `${label} is required.`;
    return '';
  }

  const text = typeof value === 'string' ? value.trim() : '';

  switch (spec.kind) {
    case 'email':
      if (!EMAIL.test(text)) return 'Enter a valid email address.';
      break;

    case 'url':
      if (!URL_RE.test(text)) return 'Enter a full web address, starting with https://';
      break;

    case 'slug':
      if (!SLUG.test(text)) {
        return 'Use lowercase letters, numbers and hyphens only.';
      }
      break;

    case 'number': {
      const cleaned = text.replace(/,/g, '');
      if (!/^[-+]?\d*\.?\d+$/.test(cleaned)) return 'Enter a number.';
      const n = Number(cleaned);
      if (spec.integer && !Number.isInteger(n)) return 'Enter a whole number.';
      if (spec.minValue !== undefined && n < spec.minValue) {
        return `Must be ${spec.minValue.toLocaleString('en-GB')} or more.`;
      }
      if (spec.maxValue !== undefined && n > spec.maxValue) {
        return `Must be ${spec.maxValue.toLocaleString('en-GB')} or less.`;
      }
      if (spec.decimals !== undefined) {
        const dp = cleaned.split('.')[1]?.length ?? 0;
        if (dp > spec.decimals) {
          return spec.decimals === 0
            ? 'Enter a whole number.'
            : `No more than ${spec.decimals} decimal places.`;
        }
      }
      break;
    }

    case 'date':
    case 'datetime': {
      const d = new Date(text);
      if (Number.isNaN(d.getTime())) return 'Enter a valid date.';
      // A four-digit year typed one digit short lands in the year 202, which
      // the browser accepts and nobody notices until a sort looks wrong.
      const year = d.getFullYear();
      if (year < 1900 || year > 2200) return 'Check the year.';
      break;
    }

    case 'choice':
      if (spec.choices?.length && !spec.choices.includes(String(value))) {
        return 'Choose one of the listed options.';
      }
      break;

    default:
      break;
  }

  if (spec.maxLength !== undefined && text.length > spec.maxLength) {
    return `Keep this to ${spec.maxLength.toLocaleString('en-GB')} characters (currently ${text.length.toLocaleString('en-GB')}).`;
  }
  if (spec.minLength !== undefined && text.length < spec.minLength) {
    return `Must be at least ${spec.minLength} characters.`;
  }

  return '';
}

/** A phone number, checked separately — it is a plain CharField server-side. */
export function validatePhone(value: string, required = false): string {
  if (!value.trim()) return required ? 'Phone number is required.' : '';
  if (!PHONE.test(value.trim())) return 'Enter a valid phone number.';
  if (value.replace(/\D/g, '').length < 6) return 'That number looks too short.';
  return '';
}

/**
 * Check a whole form at once.
 *
 * Returns a map of field name to message, empty when everything passes — the
 * shape the forms already use for server-side errors, so one rendering path
 * covers both.
 */
export function validateAll(
  scope: 'admin' | 'public',
  resource: string,
  values: Record<string, unknown>,
  labels: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  const group = CONTRACT[scope]?.[resource] ?? {};

  for (const [name, spec] of Object.entries(group)) {
    const message = validateValue(spec, values[name], labels[name] ?? name);
    if (message) errors[name] = message;
  }
  return errors;
}
