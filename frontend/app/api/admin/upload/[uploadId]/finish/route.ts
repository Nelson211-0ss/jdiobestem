import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/** Join the pieces. Refuses rather than writing a truncated file. */
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ uploadId: string }> }) {
  const { uploadId } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    return NextResponse.json(await api.post(`/uploads/${uploadId}/finish/`, body));
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { detail: err.message }, { status: err.status });
    }
    return NextResponse.json({ detail: 'The upload could not be completed.' }, { status: 502 });
  }
}
