import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  try {
    return NextResponse.json(await api.post(`/admin/boards/${boardId}/records/`, body), { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not save.' }, { status: 502 });
  }
}
