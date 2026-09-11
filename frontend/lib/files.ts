/**
 * Reading a file field's value.
 *
 * Plain module, deliberately: a field can hold several files and both the
 * server-rendered detail view and the client-side upload control need to read
 * that shape. A function exported from a `'use client'` module cannot be called
 * on the server — it can only be rendered as a component or passed as a prop —
 * so this lives outside the boundary and both sides import it.
 */

/** A file field's value as a list. Anything saved before it took several is a
 *  plain string, so both shapes have to read. */
export function toFileList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const single = String(value ?? '').trim();
  return single ? [single] : [];
}
