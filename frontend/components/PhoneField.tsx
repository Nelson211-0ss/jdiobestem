'use client';

import { useState } from 'react';

import { OTHERS, PRIMARY, joinPhone, normaliseLocal } from '@/lib/phone';

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

  const digits = normaliseLocal(local);
  // Submitted as one value, so every form and the API stay unchanged.
  const combined = joinPhone(code, local);
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
