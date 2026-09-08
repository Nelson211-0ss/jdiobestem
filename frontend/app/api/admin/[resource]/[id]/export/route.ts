import { NextResponse } from 'next/server';

import { RESOURCE_BY_KEY } from '@/lib/admin/resources';
import { getSessionToken } from '@/lib/admin/session';

/**
 * Download one record as a document.
 *
 * A proxy for the same reason as every other admin call: the browser never
 * holds the API token. Authorisation is not decided here — the backend applies
 * this person's role and country scope to the export exactly as it does to the
 * table, so there is no second access path to keep in step.
 *
 * The body is passed through as bytes rather than parsed. A PDF is not JSON,
 * and a CSV that goes through a JSON round trip stops being a CSV.
 */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function GET(req: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!RESOURCE_BY_KEY[resource]) {
    return NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
  }

  const token = await getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const query = new URL(req.url).searchParams.toString();
  const upstream = await fetch(`${BASE}/admin/${resource}/${encodeURIComponent(id)}/export/?${query}`, {
    headers: { Authorization: `Token ${token}` },
    cache: 'no-store',
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    return NextResponse.json(
      { error: detail || `Export failed (${upstream.status}).` },
      { status: upstream.status }
    );
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition':
        upstream.headers.get('content-disposition') ?? `attachment; filename="${resource}-${id}"`,
      'Cache-Control': 'no-store',
    },
  });
}
