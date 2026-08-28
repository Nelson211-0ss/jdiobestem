import { NextResponse } from 'next/server';

import { mockCheckoutRedirectUrl } from '@/lib/mockCheckoutUrl';
import { isMockCheckoutEnabled } from '@/lib/productionCheckout';
import { createCheckoutSession } from '@/lib/stripeCheckoutSession';

// Reads request headers and environment at call time; never prerender.
export const dynamic = 'force-dynamic';

const MIN_CENTS = 100; // $1.00
const MAX_CENTS = 100_000_000; // $1,000,000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * The canonical origin to send Stripe back to. Prefer an explicitly configured
 * value; fall back to the platform's own deploy URL, then to the forwarded host.
 */
function resolveSiteUrl(req: Request) {
  const fromEnv =
    process.env.PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.DEPLOY_URL ||
    null;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');

  const proto = (req.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return 'http://localhost:3000';
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS });
  }
  if (!body || typeof body !== 'object') body = {};

  const amountCents = Number.parseInt(String(body.amountCents), 10);
  if (!Number.isFinite(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
    return NextResponse.json(
      { error: 'Amount must be between $1.00 and $1,000,000.' },
      { status: 400, headers: CORS }
    );
  }

  const donorName = typeof body.donorName === 'string' ? body.donorName.trim().slice(0, 150) : '';
  const donorEmail =
    typeof body.donorEmail === 'string' ? body.donorEmail.trim().slice(0, 254) : '';
  if (!donorName) {
    return NextResponse.json(
      { error: 'Please provide your name.' },
      { status: 400, headers: CORS }
    );
  }
  if (!EMAIL_RE.test(donorEmail)) {
    return NextResponse.json(
      { error: 'Please provide a valid email address.' },
      { status: 400, headers: CORS }
    );
  }

  const siteUrl = resolveSiteUrl(req);

  if (isMockCheckoutEnabled()) {
    return NextResponse.json(
      { url: mockCheckoutRedirectUrl(siteUrl, amountCents), mock: true },
      { headers: CORS }
    );
  }

  try {
    const session = await createCheckoutSession({ amountCents, siteUrl, donorName, donorEmail });
    return NextResponse.json({ url: session.url }, { headers: CORS });
  } catch (err) {
    console.error(err);
    // Configuration problems are worth surfacing verbatim so the operator can
    // fix them; anything else stays generic.
    const code = (err as { code?: string })?.code;
    const message =
      code === 'MISSING_KEY' || code === 'STRIPE_TEST_KEY_IN_PRODUCTION'
        ? (err as Error).message
        : 'Unable to start checkout. Please try again later.';
    return NextResponse.json({ error: message }, { status: 500, headers: CORS });
  }
}
