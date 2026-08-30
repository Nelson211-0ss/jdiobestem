import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { can, getIdentity } from '@/lib/admin/api';
import { getSessionToken } from '@/lib/admin/session';

/**
 * Pull completed payments from Stripe into the donations table.
 *
 * The webhook already writes a gift the moment Stripe reports it. This exists
 * for the gaps that leaves: the months before the webhook was connected, and
 * any delivery Stripe attempted while the site was down. Stripe keeps the
 * record either way, so the fix is to go and ask it.
 *
 * It writes through the same endpoint the webhook uses, keyed on the Checkout
 * session id, so a gift already recorded is updated rather than duplicated and
 * both routes produce identical rows. Running it twice changes nothing.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

/** How far back to look when nothing is asked for: Stripe's own limit is none. */
const DEFAULT_MONTHS = 24;

export async function POST(req: Request) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // Being signed in is not the same as being allowed to write donations. This
  // route creates rows through the same endpoint the webhook uses, so without
  // this check a read-only account could add records to the ledger.
  const identity = await getIdentity();
  if (!identity || !can(identity, 'donations', 'add')) {
    return NextResponse.json(
      { error: 'Your role does not allow you to record donations.' },
      { status: 403 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not configured on this deployment (STRIPE_SECRET_KEY is unset).' },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { months?: number };
  const months = Math.min(Math.max(Number(body.months) || DEFAULT_MONTHS, 1), 120);
  const since = Math.floor(Date.now() / 1000) - months * 31 * 24 * 60 * 60;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const failures: string[] = [];

  try {
    // `autoPagingEach` walks every page rather than the first hundred, which is
    // the difference between a backfill and a sample of one.
    await stripe.checkout.sessions
      .list({ limit: 100, created: { gte: since }, expand: ['data.payment_intent'] })
      .autoPagingEach(async (session) => {
        // An abandoned checkout is not a gift. Only a paid session is money.
        if (session.payment_status !== 'paid' || !session.amount_total) {
          skipped += 1;
          return;
        }

        const intent = session.payment_intent;
        const payload = {
          stripe_session_id: session.id,
          stripe_payment_intent: typeof intent === 'string' ? intent : (intent?.id ?? ''),
          donor_name: session.customer_details?.name ?? '',
          donor_email: session.customer_details?.email ?? '',
          amount_cents: session.amount_total,
          currency: (session.currency ?? 'usd').toLowerCase(),
          status: 'succeeded',
          livemode: session.livemode,
          // Stripe's own timestamp, not today's date.
          received_on: new Date(session.created * 1000).toISOString().slice(0, 10),
        };

        const res = await fetch(`${BASE}/donations/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
            'X-API-Key': process.env.BACKEND_API_KEY ?? '',
          },
          body: JSON.stringify(payload),
          cache: 'no-store',
        });

        if (res.status === 201) imported += 1;
        else if (res.ok) updated += 1;
        else failures.push(`${session.id}: ${res.status}`);
      });
  } catch (err) {
    console.error('[donations/sync] failed', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not reach Stripe.' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    imported,
    updated,
    skipped,
    months,
    // Reported rather than swallowed: a partial import that looks complete is
    // worse than one that says which rows did not land.
    failures: failures.slice(0, 20),
    failed: failures.length,
  });
}
