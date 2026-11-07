import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/**
 * Create a staff account.
 *
 * A proxy only, like the password route beside it: whether the caller may do
 * this is decided by the backend from their token — a superuser and nobody
 * else — because a check made here could be bypassed by calling the API.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const result = await api.post('/admin/staff-accounts/', body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not create the account.' }, { status: 502 });
  }
}
