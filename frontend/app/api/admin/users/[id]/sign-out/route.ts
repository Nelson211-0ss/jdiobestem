import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/** Sign an account out everywhere. A proxy; the backend decides who may. */

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await api.post(`/admin/users/${id}/sign-out/`, {});
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not sign them out.' }, { status: 502 });
  }
}
