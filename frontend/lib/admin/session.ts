import { cookies } from 'next/headers';

/**
 * The dashboard session.
 *
 * The Django token lives in an httpOnly cookie, so no script on the page can
 * read it — an XSS in the dashboard cannot walk away with a credential that
 * unlocks every record the Foundation holds. Server components read it and call
 * the API directly; the browser never holds the token at all.
 */

export const SESSION_COOKIE = 'jdiobe_admin_token';

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
