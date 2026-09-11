import { NextResponse } from 'next/server';

/**
 * Record that a story was opened, or finished.
 *
 * A proxy so the browser never holds the API key, like every other call to the
 * backend. Counted from the browser rather than when the page renders: the
 * story pages are cached and served without reaching the application, so
 * counting on render would report how often the cache was rebuilt.
 */

export const dynamic = 'force-dynamic';

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const KEY = process.env.BACKEND_API_KEY || '';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!KEY || !/^[a-z0-9-]{1,200}$/.test(slug)) return new NextResponse(null, { status: 204 });

  let read = false;
  try {
    read = Boolean(((await req.json()) as { read?: boolean })?.read);
  } catch {
    // A beacon with no body is an open, which is the common case.
  }

  try {
    await fetch(`${BASE}/content/news/${encodeURIComponent(slug)}/read/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': KEY },
      body: JSON.stringify({ read }),
      cache: 'no-store',
    });
  } catch {
    // Counting is not worth an error in front of a reader.
  }
  return new NextResponse(null, { status: 204 });
}
