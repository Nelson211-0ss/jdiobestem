import { NextResponse } from 'next/server';

/**
 * One piece of a resumable upload.
 *
 * Streamed straight through rather than buffered and re-encoded: the whole
 * point of chunking is that no single hop holds the entire file.
 */
export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const API_KEY = process.env.BACKEND_API_KEY || '';

export async function POST(req: Request, { params }: { params: Promise<{ uploadId: string }> }) {
  const { uploadId } = await params;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ detail: 'Invalid chunk.' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/uploads/${uploadId}/part/`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: 'That piece did not reach the server.' }, { status: 502 });
  }
}
