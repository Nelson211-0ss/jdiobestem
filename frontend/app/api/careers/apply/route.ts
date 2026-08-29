import { NextResponse } from 'next/server';

import { postToBackend } from '@/lib/backend';
import { getOpenJobs } from '@/lib/site-content';

/**
 * An application from the careers page.
 *
 * Goes through `postToBackend`, the same service-key path every other public
 * form uses — not the dashboard client, which authenticates as whoever is
 * signed in and would refuse a visitor.
 *
 * The browser sends a posting's slug, never its id, and it is resolved here
 * against the postings that are actually open. A stale page left in a tab
 * cannot apply for a post that has since been filled.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: 'Invalid request.' }, { status: 400 });
  }

  const slug = String(body.slug ?? '').trim();
  const jobs = await getOpenJobs();
  const job = jobs.find((j) => j.slug === slug);
  if (!job) {
    return NextResponse.json(
      { detail: 'That position is no longer open. Please choose another.' },
      { status: 400 },
    );
  }

  const result = await postToBackend('/jobs/apply/', {
    slug,
    name: String(body.name ?? '').trim(),
    email: String(body.email ?? '').trim(),
    phone: String(body.phone ?? '').trim(),
    cover_letter: String(body.cover_letter ?? '').trim(),
    cv: String(body.cv ?? '').trim(),
    country: job.country || 'GL',
  });

  if (!result.ok) {
    return NextResponse.json({ detail: result.error }, { status: result.status || 502 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
