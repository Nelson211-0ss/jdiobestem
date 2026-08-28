import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/**
 * The newsletter actions that are not plain CRUD: preview, audience, test and
 * send.
 *
 * It sits outside the generic `/api/admin/[resource]` tree deliberately — a
 * `newsletters/` directory in there would sit alongside the dynamic segment
 * that serves every other resource, and shadowing rules are not something to
 * leave to chance on a route this central.
 *
 * Authorisation stays the backend's decision; this only forwards.
 */

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string; action: string }> };

/** GET actions read; POST actions do something. Nothing else is reachable. */
const READ_ACTIONS = new Set(['preview', 'audience', 'deliveries']);
const WRITE_ACTIONS = new Set(['test', 'send']);

function fail(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    return NextResponse.json(err.body ?? { detail: err.message }, { status: err.status });
  }
  return NextResponse.json({ detail: fallback }, { status: 502 });
}

export async function GET(_req: Request, { params }: Params) {
  const { id, action } = await params;
  if (!READ_ACTIONS.has(action)) {
    return NextResponse.json({ detail: 'Unknown action.' }, { status: 404 });
  }
  try {
    return NextResponse.json(await api.get(`/admin/newsletters/${id}/${action}/`));
  } catch (err) {
    return fail(err, 'Could not load.');
  }
}

export async function POST(req: Request, { params }: Params) {
  const { id, action } = await params;
  if (!WRITE_ACTIONS.has(action)) {
    return NextResponse.json({ detail: 'Unknown action.' }, { status: 404 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // test and send both tolerate an empty body; the backend validates.
  }

  try {
    return NextResponse.json(await api.post(`/admin/newsletters/${id}/${action}/`, body));
  } catch (err) {
    return fail(err, action === 'send' ? 'Could not send.' : 'Could not run that.');
  }
}
