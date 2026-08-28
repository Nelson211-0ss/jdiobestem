import { NextResponse } from 'next/server';

import { postToBackend } from '@/lib/backend';

/**
 * Contact form endpoint — a proxy onto the Django backend.
 *
 * The form used to compose a `mailto:` and hand off to the visitor's own mail
 * client, which meant a message only arrived if they had one configured and
 * actually pressed send. Nothing was ever recorded. Now it is stored first and
 * notified second, like every other form on the site.
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

  const result = await postToBackend('/contact/', {
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim(),
    topic: String(body.topic ?? body.subject ?? '').trim(),
    message: String(body.message ?? '').trim(),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: CORS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS });
}
