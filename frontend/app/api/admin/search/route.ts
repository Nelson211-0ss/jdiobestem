import { NextResponse } from 'next/server';

import { api, ApiError } from '@/lib/admin/api';

/** Search proxy. Scoping and permissions are the backend's decision. */

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  try {
    return NextResponse.json(await api.get(`/admin/search/?q=${encodeURIComponent(q)}`));
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ results: [] }, { status: err.status });
    }
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
