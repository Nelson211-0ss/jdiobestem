import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';
import { revalidatePublicContent } from '@/lib/admin/revalidate';
import { RESOURCE_BY_KEY } from '@/lib/admin/resources';

/** Update or delete one record. Authorisation is the backend's decision. */

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ resource: string; id: string }> };

function guard(resource: string) {
  return RESOURCE_BY_KEY[resource]
    ? null
    : NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
}

export async function PATCH(req: Request, { params }: Params) {
  const { resource, id } = await params;
  const bad = guard(resource);
  if (bad) return bad;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const updated = await api.patch(`/admin/${resource}/${id}/`, body);
    revalidatePublicContent(resource);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not save.' }, { status: 502 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { resource, id } = await params;
  const bad = guard(resource);
  if (bad) return bad;

  try {
    await api.delete(`/admin/${resource}/${id}/`);
    revalidatePublicContent(resource);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not delete.' }, { status: 502 });
  }
}
