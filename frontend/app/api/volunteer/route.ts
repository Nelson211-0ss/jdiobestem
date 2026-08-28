import { NextResponse } from 'next/server';

import { postToBackend } from '@/lib/backend';

/**
 * Volunteer application endpoint — a proxy onto the Django backend.
 *
 * The backend validates the application, stores it in Postgres, and sends the
 * notification email. This handler exists so the browser talks to its own
 * origin and never sees the service key.
 *
 * The response contract is unchanged from when this route did the work itself:
 * `{ ok: true }` on success, `{ error }` otherwise, so the form component did
 * not need touching.
 */

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS });
  }

  const result = await postToBackend('/volunteers/', {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim(),
    phone: String(body.phone ?? '').trim(),
    interest: String(body.interest ?? '').trim(),
    message: String(body.message ?? '').trim(),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: CORS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS });
}
