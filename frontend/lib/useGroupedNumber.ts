'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { groupWhileTyping, toNumber } from '@/lib/format';

/**
 * Thousands separators in a text input, without the caret jumping.
 *
 * Inserting a separator shifts every character after it, so writing the
 * regrouped value back naively sends the cursor to the end and `1234567` comes
 * out reversed. Position is tracked instead by how many digits precede the
 * caret — a count that survives regrouping — and restored to the same digit.
 *
 * The hook owns the displayed text; the caller owns the plain number. Returned
 * props go straight onto an `<input>`, whatever its styling, so the site's
 * fields and the dashboard's can share this without sharing a component.
 */
export function useGroupedNumber(value: string, onChange: (raw: string) => void) {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const [text, setText] = useState(() => groupWhileTyping(value ?? ''));
  const lastExternal = useRef(value);

  // Follow a value set from outside — a record loading, a preset chip clicked
  // — but never while the field has focus, which would fight the typist.
  if (
    value !== lastExternal.current &&
    (typeof document === 'undefined' || document.activeElement !== ref.current)
  ) {
    lastExternal.current = value;
    const next = groupWhileTyping(value ?? '');
    if (next !== text) setText(next);
  }

  useLayoutEffect(() => {
    if (caret.current === null || !ref.current) return;
    const pos = caret.current;
    caret.current = null;
    ref.current.setSelectionRange(pos, pos);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const selection = e.target.selectionStart ?? raw.length;
    const digitsBefore = (raw.slice(0, selection).match(/\d/g) ?? []).length;

    const formatted = groupWhileTyping(raw);

    // Walk the regrouped text until that many digits have gone by.
    let seen = 0;
    let pos = formatted.length;
    for (let i = 0; i < formatted.length; i += 1) {
      if (seen === digitsBefore) {
        pos = i;
        break;
      }
      if (/\d/.test(formatted[i])) seen += 1;
      if (seen === digitsBefore) pos = i + 1;
    }
    caret.current = pos;

    setText(formatted);
    const plain = formatted.replace(/,/g, '');
    lastExternal.current = plain;
    onChange(plain);
  };

  /**
   * Tidy up what was left mid-typing — a lone `-`, a trailing `.`, `007`.
   * Only on the way out, never while it is being typed.
   */
  const commit = () => {
    const n = toNumber(text);
    if (n !== null) {
      setText(groupWhileTyping(String(n)));
      lastExternal.current = String(n);
      onChange(String(n));
    } else if (text.trim() !== '') {
      setText('');
      lastExternal.current = '';
      onChange('');
    }
  };

  return {
    ref,
    /** What the input shows: grouped. */
    value: text,
    onChange: handleChange,
    commit,
    inputMode: 'decimal' as const,
    type: 'text' as const,
    autoComplete: 'off',
  };
}
