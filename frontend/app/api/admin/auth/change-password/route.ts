import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';
import { SESSION_COOKIE } from '@/lib/admin/session';

/**
 * Change your own password.
 *
 * The backend reissues the token, because changing a password ends every other
 * session — including, without this, the one doing the changing. The new token
 * replaces the cookie so the person stays signed in here and nobody else does.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await api.post<{ detail: string; token: string }>(
      '/auth/change-password/',
      body,
    );

    const response = NextResponse.json({ detail: result.detail });
    if (result.token) {
      response.cookies.set(SESSION_COOKIE, result.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 12,
      });
    }
    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      // Field errors are handed back untouched so the form can point at the
      // right box and show the validator's own wording.
      return NextResponse.json(err.body ?? { detail: err.message }, { status: err.status });
    }
    return NextResponse.json({ detail: 'Could not change the password.' }, { status: 502 });
  }
}
