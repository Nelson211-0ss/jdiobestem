import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/** Read and update one person's access. Authorisation is the backend's call. */

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    return NextResponse.json(await api.get(`/admin/users/${id}/access/`));
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not load.' }, { status: 502 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await api.patch(`/admin/users/${id}/access/update/`, body));
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not save.' }, { status: 502 });
  }
}
