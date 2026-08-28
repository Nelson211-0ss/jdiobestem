import { NextResponse } from 'next/server';

import { SESSION_COOKIE } from '@/lib/admin/session';

/**
 * Sign in.
 *
 * Credentials go to Django, which decides whether they are valid and whether
 * the account has dashboard access. The token it returns is stored in an
 * httpOnly cookie so no script can read it; the browser never handles it.
 */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: body.username ?? '', password: body.password ?? '' }),
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[admin-login] backend unreachable', err);
    return NextResponse.json(
      { error: 'The dashboard service is not responding. Try again shortly.' },
      { status: 502 }
    );
  }

  const payload = (await res.json().catch(() => ({}))) as { token?: string; detail?: string };

  if (!res.ok || !payload.token) {
    return NextResponse.json(
      { error: payload.detail || 'Those details were not recognised.' },
      { status: res.status === 500 ? 502 : res.status }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, payload.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
