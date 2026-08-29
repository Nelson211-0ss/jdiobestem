'use client';

import { useState } from 'react';

/**
 * A telephone number with its country code chosen rather than typed.
 *
 * Numbers arrive in every shape — 0700…, +256700…, 256 700… — and the same
 * person is then unreachable from a different country, or appears twice in the
 * list. Picking the code fixes the prefix and leaves only the local part to
 * type.
 *
 * The three countries the Foundation works in lead the list because that is
 * who almost everyone is; the rest follow so a partner or applicant from
 * anywhere else is not stuck. The field submits one combined value, so nothing
 * downstream has to know this control exists.
 */

type Dial = { code: string; label: string; flag: string };

/** Where the Foundation operates, first. */
const PRIMARY: Dial[] = [
  { code: '+256', label: 'Uganda', flag: '🇺🇬' },
  { code: '+211', label: 'South Sudan', flag: '🇸🇸' },
  { code: '+1', label: 'United States', flag: '🇺🇸' },
];

/** Everywhere else the Foundation has plausible contact with. */
const OTHERS: Dial[] = [
  { code: '+254', label: 'Kenya', flag: '🇰🇪' },
  { code: '+255', label: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', label: 'Rwanda', flag: '🇷🇼' },
  { code: '+257', label: 'Burundi', flag: '🇧🇮' },
  { code: '+251', label: 'Ethiopia', flag: '🇪🇹' },
  { code: '+249', label: 'Sudan', flag: '🇸🇩' },
  { code: '+27', label: 'South Africa', flag: '🇿🇦' },
  { code: '+234', label: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', label: 'Ghana', flag: '🇬🇭' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+353', label: 'Ireland', flag: '🇮🇪' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+31', label: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', label: 'Sweden', flag: '🇸🇪' },
  { code: '+47', label: 'Norway', flag: '🇳🇴' },
  { code: '+45', label: 'Denmark', flag: '🇩🇰' },
  { code: '+39', label: 'Italy', flag: '🇮🇹' },
  { code: '+34', label: 'Spain', flag: '🇪🇸' },
  { code: '+41', label: 'Switzerland', flag: '🇨🇭' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+64', label: 'New Zealand', flag: '🇳🇿' },
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+86', label: 'China', flag: '🇨🇳' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+971', label: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+966', label: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+20', label: 'Egypt', flag: '🇪🇬' },
  { code: '+212', label: 'Morocco', flag: '🇲🇦' },
  { code: '+55', label: 'Brazil', flag: '🇧🇷' },
  { code: '+52', label: 'Mexico', flag: '🇲🇽' },
];

/** A local number, with the leading zero trunk prefix dropped. */
function normalise(local: string): string {
  const digits = local.replace(/[^\d]/g, '');
  return digits.replace(/^0+/, '');
}

export default function PhoneField({
  id = 'phone',
  name = 'phone',
  label = 'Phone',
  required = false,
  defaultCode = '+256',
  help,
}: {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  defaultCode?: string;
  help?: string;
}) {
  const [code, setCode] = useState(defaultCode);
  const [local, setLocal] = useState('');

  const digits = normalise(local);
  // Submitted as one value, so every form and the API stay unchanged.
  const combined = digits ? `${code}${digits}` : '';
  const tooShort = digits.length > 0 && digits.length < 6;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? ' *' : ''}
      </label>

      <div className="phone-field">
        <select
          aria-label="Country dialling code"
          className="field phone-field__code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
          <optgroup label="Where we work">
            {PRIMARY.map((d) => (
              <option key={d.code} value={d.code}>
                {d.flag} {d.label} {d.code}
              </option>
            ))}
          </optgroup>
          <optgroup label="Elsewhere">
            {OTHERS.map((d) => (
              <option key={`${d.code}-${d.label}`} value={d.code}>
                {d.flag} {d.label} {d.code}
              </option>
            ))}
          </optgroup>
        </select>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          placeholder="700 000 000"
          className="field phone-field__number"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          aria-describedby={tooShort ? `${id}-hint` : undefined}
        />
      </div>

      {/* What actually reaches the server: one number, in one shape. */}
      <input type="hidden" name={name} value={combined} />

      <p id={`${id}-hint`} className="donate-hint">
        {tooShort
          ? 'That looks too short — check the number.'
          : combined
            ? `Will be sent as ${combined}`
            : (help ?? 'Choose the country, then type the number without the leading zero.')}
      </p>
    </div>
  );
}
