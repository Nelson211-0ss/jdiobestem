import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';
import { revalidatePublicContent } from '@/lib/admin/revalidate';
import { RESOURCE_BY_KEY } from '@/lib/admin/resources';

/**
 * Create a record.
 *
 * A proxy, so the browser never holds the API token. Authorisation is not
 * decided here — the token carries the person's identity and the backend
 * applies their role. This only refuses resources that do not exist.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!RESOURCE_BY_KEY[resource]) {
    return NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const created = await api.post(`/admin/${resource}/`, body);
    revalidatePublicContent(resource);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      // Field errors are handed straight back so the form can highlight them.
      return NextResponse.json(err.body ?? { error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Could not save.' }, { status: 502 });
  }
}
