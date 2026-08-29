import { NextResponse } from 'next/server';

/**
 * A CV, on its way to object storage.
 *
 * Applicants are members of the public, so this cannot forward the browser's
 * request to the dashboard's upload endpoint as-is. It re-sends it server-side
 * with the service key, and pins the folder to `cv` so this route can only
 * ever write there.
 */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const API_KEY = process.env.BACKEND_API_KEY || '';

export async function POST(req: Request) {
  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return NextResponse.json({ detail: 'Invalid upload.' }, { status: 400 });
  }

  const file = incoming.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ detail: 'No file was sent.' }, { status: 400 });
  }

  const body = new FormData();
  body.append('file', file);

  try {
    const res = await fetch(`${BASE}/jobs/cv/`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail ?? 'That file could not be uploaded.' },
        { status: res.status },
      );
    }
    return NextResponse.json({ url: data.url, path: data.path });
  } catch {
    return NextResponse.json({ detail: 'That file could not be uploaded.' }, { status: 502 });
  }
}
