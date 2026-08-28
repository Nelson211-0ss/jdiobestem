import { NextResponse } from 'next/server';

import { SESSION_COOKIE, getSessionToken } from '@/lib/admin/session';

/** Sign out: destroy the token server-side, then clear the cookie. */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function POST() {
  const token = await getSessionToken();

  if (token) {
    // Deleting it in Django means the token is dead everywhere, not merely
    // forgotten by this browser.
    await fetch(`${BASE}/auth/logout/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      cache: 'no-store',
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
