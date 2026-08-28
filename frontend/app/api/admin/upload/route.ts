import { NextResponse } from 'next/server';

import { getSessionToken } from '@/lib/admin/session';

/**
 * Upload proxy.
 *
 * Streams the multipart body straight through to the backend with the staff
 * member's token. The browser never sees the token, and the file never touches
 * the Next.js filesystem — it goes to Cloudflare R2 (or local storage in
 * development) under whatever the backend has configured.
 */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function POST(req: Request) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const form = await req.formData();

  try {
    const res = await fetch(`${BASE}/uploads/`, {
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      body: form,
      cache: 'no-store',
    });
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    if (!res.ok) {
      return NextResponse.json({ error: body.detail || 'Upload failed.' }, { status: res.status });
    }
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    console.error('[admin-upload] failed', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 502 });
  }
}
