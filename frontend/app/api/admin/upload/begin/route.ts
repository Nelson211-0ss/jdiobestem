import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/** Start a resumable upload. Authorisation stays the backend's decision. */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(await api.post('/uploads/begin/', body));
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { detail: err.message }, { status: err.status });
    }
    return NextResponse.json({ detail: 'Could not start the upload.' }, { status: 502 });
  }
}
