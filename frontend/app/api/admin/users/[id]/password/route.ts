import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/**
 * Set another account's password.
 *
 * A proxy only. Whether the caller may do this is decided by the backend from
 * their token — a superuser and nobody else — because a check made here could
 * be bypassed by calling the API directly.
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
    const result = await api.post(`/admin/users/${id}/password/`, body);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not set the password.' }, { status: 502 });
  }
}
