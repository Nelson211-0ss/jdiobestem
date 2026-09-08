import { NextResponse } from 'next/server';

import { getSessionToken } from '@/lib/admin/session';

/**
 * Download a board's records as a file.
 *
 * Boards are addressed by slug and are not in the resource registry, so they
 * need their own proxy — but the shape is the same as every other export: the
 * token stays on the server, and the backend applies this person's role and
 * country scope to the file exactly as it does to the table.
 */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function GET(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  if (!/^[A-Za-z0-9_-]{1,140}$/.test(boardId)) {
    return NextResponse.json({ error: 'Unknown board.' }, { status: 404 });
  }

  const token = await getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const query = new URL(req.url).searchParams.toString();
  const upstream = await fetch(
    `${BASE}/admin/boards/${encodeURIComponent(boardId)}/records/export/?${query}`,
    { headers: { Authorization: `Token ${token}` }, cache: 'no-store' }
  );

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
        upstream.headers.get('content-disposition') ?? `attachment; filename="${boardId}"`,
      'Cache-Control': 'no-store',
    },
  });
}
