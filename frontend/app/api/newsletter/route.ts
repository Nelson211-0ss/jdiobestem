import { NextResponse } from 'next/server';

import { postToBackend } from '@/lib/backend';

/**
 * Newsletter signup — a proxy onto the Django backend.
 *
 * Subscribers are now a table rather than an email to an inbox, so the list can
 * actually be exported. Signing up twice is not an error: the backend treats a
 * repeat as a no-op and re-subscribes anyone who had previously opted out.
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

  const result = await postToBackend('/newsletter/', {
    email: String(body.email ?? '').trim().toLowerCase(),
    source: String(body.source ?? 'newsletter').slice(0, 100),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: CORS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS });
}
