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
): 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'readonly' {
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
    // A receipt, a signed form, a photograph of a delivery. Uploaded and
    // shown: a record of a payment without its receipt is half a record.
    case 'file':
      return 'file';
    // Structured values that came across as JSON. Shown, not edited —
    // editing them properly needs a picker that belongs to a later pass.
    case 'people':
    case 'multiple-person':
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
