/**
 * Types for the imported operations boards.
 *
 * These came out of monday.com during the migration. Postgres is the system of
 * record now — nothing is written back, and the monday ids survive only so a
 * record can be traced to where it came from.
 */

export type BoardColumn = {
  id: number;
  monday_id: string;
  title: string;
  column_type: string;
  position: number;
  show_in_list: boolean;
  choices: { value: string; label: string }[];
};

export type BoardGroup = { id: number; monday_id: string; title: string; color: string; position: number };

export type Board = {
  id: number;
  monday_id: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  item_count: number;
  synced_at: string | null;
};

export type BoardDetail = Board & { columns: BoardColumn[]; groups: BoardGroup[] };

export type BoardRecord = {
  id: number;
  monday_id: string;
  name: string;
  group_id: string;
  group_title: string;
  values: Record<string, unknown>;
  country: string;
  office: number | null;
  office_name: string;
  is_local: boolean;
  created_by_name: string;
  monday_updated_at: string | null;
};

export type BoardIndex = {
  categories: {
    name: string;
    boards: { monday_id: string; name: string; description: string; item_count: number; synced_at: string | null }[];
  }[];
};

/** Which input a column type gets in the record form. */
export function inputFor(
  column: BoardColumn,
):
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'file'
  | 'people'
  | 'email'
  | 'phone'
  | 'readonly' {
  switch (column.column_type) {
    case 'status':
    case 'dropdown':
      return 'select';
    case 'numbers':
    case 'numeric':
      return 'number';
    case 'date':
    case 'timeline':
      return 'date';
    case 'long_text':
      return 'textarea';
    case 'checkbox':
      return 'checkbox';
    // Typed rather than free text, so a mistyped address is caught here and
    // the number is stored in one shape instead of six.
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    // A receipt, a signed form, a photograph of a delivery. Uploaded and
    // shown: a record of a payment without its receipt is half a record.
    case 'file':
      return 'file';
    // Structured values that came across as JSON. Shown, not edited —
    // editing them properly needs a picker that belongs to a later pass.
    // Who this is assigned to. Picked from the staff list rather than
    // typed, so the same person is not recorded three different ways.
    case 'people':
    case 'multiple-person':
      return 'people';
    case 'board_relation':
    case 'dependency':
    case 'mirror':
    case 'subtasks':
    case 'link':
      return 'readonly';
    default:
      return 'text';
  }
}

/**
 * What a column will accept, beyond its type.
 *
 * Board columns carry no required flag — nothing but the record's name is
 * mandatory — so this checks shape, not presence: a number that is a number, a
 * date that is a real date, an address that could exist.
 */
export function validateColumn(column: BoardColumn, value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return '';

  const kind = inputFor(column);
  const looksLikeEmail = /e-?mail/i.test(column.title);
  const looksLikePhone = /phone|mobile|tel\b/i.test(column.title);

  if (kind === 'email' || (kind === 'text' && looksLikeEmail)) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) return 'Enter a valid email address.';
  }
  if (kind === 'phone' || (kind === 'text' && looksLikePhone)) {
    if (text.replace(/\D/g, '').length < 6) return 'That number looks too short.';
    if (!/^[\d\s()+-]{6,20}$/.test(text)) return 'Enter a valid phone number.';
  }
  if (kind === 'number') {
    if (!/^[-+]?\d*\.?\d+$/.test(text.replace(/,/g, ''))) return 'Enter a number.';
  }
  if (kind === 'date') {
    const d = new Date(text);
    if (Number.isNaN(d.getTime())) return 'Enter a valid date.';
    const year = d.getFullYear();
    if (year < 1900 || year > 2200) return 'Check the year.';
  }
  return '';
}

/** A column value as a plain string, whatever shape it arrived in. */
export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    const wrapped = value as { text?: string };
    return typeof wrapped.text === 'string' ? wrapped.text : '';
  }
  return String(value);
}
