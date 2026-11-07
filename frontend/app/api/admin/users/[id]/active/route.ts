import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/**
 * Revoke or restore an account — `{ "active": false | true }`.
 *
 * A proxy only; the backend decides who may, and revoking also signs the
 * account out everywhere there.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await api.post(`/admin/users/${id}/active/`, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not change access.' }, { status: 502 });
  }
}
