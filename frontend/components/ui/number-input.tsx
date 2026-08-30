'use client';

import { Input } from '@/components/ui/input';
import { useGroupedNumber } from '@/lib/useGroupedNumber';

/**
 * A number field that shows its thousands separators as you type.
 *
 * Not `<input type="number">`: that control refuses to display a comma at all,
 * and its spinner arrows silently change an amount when someone scrolls a long
 * form. This is a text input constrained to numeric input, which also gives
 * phones the numeric keypad via `inputMode`.
 *
 * `value` and `onChange` speak the unformatted number, so nothing upstream has
 * to strip commas.
 */
export default function NumberInput({
  id,
  value,
  onChange,
  disabled,
  required,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': describedBy,
  onBlur,
}: {
  id?: string;
  value: string;
  onChange: (raw: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  onBlur?: () => void;
}) {
  const { commit, ...field } = useGroupedNumber(value, onChange);

  return (
    <Input
      id={id}
      className={className}
      required={required}
      disabled={disabled}
      aria-invalid={ariaInvalid}
      aria-describedby={describedBy}
      {...field}
      onBlur={() => {
        commit();
        onBlur?.();
      }}
    />
  );
}
