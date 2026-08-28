import Stripe from 'stripe';

import { sendDonorThankYou, appendToSheet } from './donationNotifications';
import { saveDonation } from './backendDonation';
import { assertLiveStripeSecretInProduction } from './productionCheckout';

/**
 * Central place a completed donation is handed off to.
 *
 * Always logs one structured JSON line (visible in your serverless function
 * logs — Vercel: Deployments → Functions → stripe-webhook; Netlify: Functions →
 * stripe-webhook), and donors get Stripe's own email receipt.
 *
 * It then stores the donation in the Django backend, which is what sends the
 * staff notification, and fires the remaining optional side effects (the donor
 * thank-you, an append to a Google Sheet), each active only if its env vars are
 * set. All of these are best-effort: a failure is logged but never thrown,
 * because a 500 here would make Stripe retry the webhook and double-notify.
 *
 * @param {{
 *   amount: number|null, currency: string|null, email: string|null,
 *   name: string|null, sessionId: string, paymentIntent: string|null,
 *   createdAt: string
 * }} donation
 */
export async function recordDonation(donation) {
  console.log('[donation]', JSON.stringify(donation));

  const results = await Promise.allSettled([
    saveDonation(donation),
    sendDonorThankYou(donation),
    appendToSheet(donation),
  ]);
  const labels = ['[donation:backend]', '[donation:donor-thankyou]', '[donation:sheet]'];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(labels[i], (r.reason && r.reason.message) || r.reason);
    }
  });
}

/**
 * Verify a Stripe webhook payload and act on the events we care about.
 * Returns the parsed Stripe event on success; throws with a `.code` on failure.
 *
 * @param {{ rawBody: Buffer|string, signature: string }} opts
 */
export async function handleStripeEvent(opts) {
  const { rawBody, signature } = opts;

  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Missing STRIPE_SECRET_KEY.');
    err.code = 'MISSING_KEY';
    throw err;
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    const err = new Error('Missing STRIPE_WEBHOOK_SECRET.');
    err.code = 'MISSING_WEBHOOK_SECRET';
    throw err;
  }

  assertLiveStripeSecretInProduction();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    const err = new Error(`Webhook signature verification failed: ${e.message}`);
    err.code = 'BAD_SIGNATURE';
    throw err;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Only record sessions that were actually paid.
    if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
      const details = session.customer_details || {};
      const meta = session.metadata || {};
      await recordDonation({
        amount: session.amount_total != null ? session.amount_total / 100 : null,
        currency: session.currency || null,
        email: details.email || meta.donor_email || null,
        name: details.name || meta.donor_name || null,
        sessionId: session.id,
        paymentIntent: session.payment_intent || null,
        livemode: Boolean(event.livemode),
        createdAt: new Date((event.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      });
    }
  }

  return event;
}
