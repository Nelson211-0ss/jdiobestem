/**
 * Persist a completed donation to the Django backend.
 *
 * Best-effort, like the other post-donation side effects: a failure is logged
 * and swallowed, because throwing here would return 500 to Stripe, which
 * retries — and a retry would re-run every notification. The donation itself is
 * never at risk; Stripe remains the source of truth for money and this row is
 * the Foundation's own copy of it.
 */

const BASE_URL = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const API_KEY = process.env.BACKEND_API_KEY || '';

export async function saveDonation(donation) {
  if (!API_KEY) {
    console.warn('[donation:backend] BACKEND_API_KEY is not set — donation not stored');
    return false;
  }

  // Stripe reports money in minor units; recordDonation has already divided by
  // 100 for the notification path, so multiply back rather than storing a float.
  const amountCents =
    donation.amount != null ? Math.round(Number(donation.amount) * 100) : 0;

  const res = await fetch(`${BASE_URL}/donations/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({
      stripe_session_id: donation.sessionId,
      stripe_payment_intent: donation.paymentIntent || '',
      donor_name: donation.name || '',
      donor_email: donation.email || '',
      amount_cents: amountCents,
      currency: donation.currency || 'usd',
      status: 'succeeded',
      livemode: Boolean(donation.livemode),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[donation:backend] responded', res.status, body.slice(0, 300));
    return false;
  }
  return true;
}
