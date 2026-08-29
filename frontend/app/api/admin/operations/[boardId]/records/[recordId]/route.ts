import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ boardId: string; recordId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { boardId, recordId } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await api.patch(`/admin/boards/${boardId}/records/${recordId}/`, body));
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not save.' }, { status: 502 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { boardId, recordId } = await params;
  try {
    await api.delete(`/admin/boards/${boardId}/records/${recordId}/`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not delete.' }, { status: 502 });
  }
}
