'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_DIALS, DEFAULT_DIAL, OTHERS, PRIMARY, joinPhone, splitPhone } from '@/lib/phone';

/**
 * A phone number in the dashboard, with its country code picked rather than
 * typed — the same control the website form offers, in dashboard clothing.
 *
 * Controlled, because a record being edited already holds a number: it is
 * split back into the two boxes on the way in, so `+256700123456` shows as
 * Uganda plus `700123456` rather than as an unreadable run of digits.
 */
export default function PhoneInput({
  id,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
  onBlur,
}: {
  id?: string;
  value: string;
  onChange: (combined: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
}) {
  const initial = splitPhone(value ?? '');
  const [code, setCode] = useState(initial.code);
  const [local, setLocal] = useState(initial.local);

  // A number that arrived from outside — switching records — replaces what is
  // shown, but only while nobody is mid-edit.
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    const next = splitPhone(value ?? '', code);
    setCode(next.code);
    setLocal(next.local);
  }

  const push = (nextCode: string, nextLocal: string) => {
    setCode(nextCode);
    setLocal(nextLocal);
    const combined = joinPhone(nextCode, nextLocal);
    setSeen(combined);
    onChange(combined);
  };

  const label = ALL_DIALS.find((d) => d.code === code);

  return (
    <div className="flex gap-2">
      <Select value={code} disabled={disabled} onValueChange={(v) => push(v, local)}>
        <SelectTrigger className="h-12 w-[8.5rem] shrink-0" aria-label="Country dialling code">
          <SelectValue>
            {label ? `${label.flag} ${label.code}` : DEFAULT_DIAL}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Where we work</SelectLabel>
            {PRIMARY.map((d) => (
              <SelectItem key={d.code} value={d.code}>
                {d.flag} {d.label} {d.code}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Elsewhere</SelectLabel>
            {OTHERS.map((d) => (
              <SelectItem key={`${d.code}-${d.label}`} value={d.code}>
                {d.flag} {d.label} {d.code}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="700 000 000"
        className="h-12"
        value={local}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onChange={(e) => push(code, e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}
