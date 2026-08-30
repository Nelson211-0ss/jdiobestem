/**
 * Dialling codes, and the rules for splitting and joining a number.
 *
 * Shared so the website form and the dashboard offer the same list and store
 * the same shape. A number typed in the admin and one submitted by a volunteer
 * should be the same string, or the two records never match.
 */

export type Dial = { code: string; label: string; flag: string };

/** Where the Foundation operates, first — that is who almost everyone is. */
export const PRIMARY: Dial[] = [
  { code: '+256', label: 'Uganda', flag: '🇺🇬' },
  { code: '+211', label: 'South Sudan', flag: '🇸🇸' },
  { code: '+1', label: 'United States', flag: '🇺🇸' },
];

/** Everywhere else the Foundation has plausible contact with. */
export const OTHERS: Dial[] = [
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

export const ALL_DIALS: Dial[] = [...PRIMARY, ...OTHERS];

export const DEFAULT_DIAL = '+256';

/** A local number with the trunk prefix dropped: `0700…` becomes `700…`. */
export function normaliseLocal(local: string): string {
  return local.replace(/[^\d]/g, '').replace(/^0+/, '');
}

/** One value from the two controls, or '' when nothing has been typed. */
export function joinPhone(code: string, local: string): string {
  const digits = normaliseLocal(local);
  return digits ? `${code}${digits}` : '';
}

/**
 * Split a stored number back into the two controls.
 *
 * Longest code first, so +254 is not read as +2 — and an unrecognised or
 * locally-typed number keeps its digits in the local box rather than being
 * silently reassigned to Uganda.
 */
export function splitPhone(value: string, fallback = DEFAULT_DIAL): { code: string; local: string } {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return { code: fallback, local: '' };

  if (trimmed.startsWith('+')) {
    const codes = [...ALL_DIALS].sort((a, b) => b.code.length - a.code.length);
    for (const dial of codes) {
      if (trimmed.startsWith(dial.code)) {
        return { code: dial.code, local: trimmed.slice(dial.code.length).replace(/\D/g, '') };
      }
    }
  }
  return { code: fallback, local: trimmed.replace(/\D/g, '') };
}
