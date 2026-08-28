import { NextResponse } from 'next/server';

import { handleStripeEvent } from '@/lib/stripeWebhook';

// Signature verification needs the exact bytes Stripe sent, and the handler
// talks to the network — so no caching or prerendering.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header.' }, { status: 400 });
  }

  let rawBody: Buffer;
  try {
    rawBody = Buffer.from(await req.arrayBuffer());
  } catch {
    return NextResponse.json({ error: 'Could not read request body.' }, { status: 400 });
  }

  try {
    await handleStripeEvent({ rawBody, signature });
    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as { code?: string; message?: string };
    console.error('[stripe-webhook]', error?.message);
    // A bad signature is the client's fault (400); everything else is 500 so
    // Stripe retries delivery.
    const status = error?.code === 'BAD_SIGNATURE' ? 400 : 500;
    return NextResponse.json({ error: error?.message || 'Webhook handler error.' }, { status });
  }
}
