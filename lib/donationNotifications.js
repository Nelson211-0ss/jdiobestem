// Optional "tell someone about this donation" side-channels used by
// recordDonation() in stripeWebhook.js. Each is a no-op unless its env vars are
// set, uses native fetch (no npm deps), and throws on real failures so the
// caller can log them — while treating them as best-effort (never fatal).

const RESEND_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';

function formatAmount(donation) {
  if (donation.amount == null) return 'unknown amount';
  const currency = (donation.currency || '').toUpperCase();
  return `${donation.amount.toFixed(2)}${currency ? ' ' + currency : ''}`;
}

/**
 * Email a donation alert via Resend (https://resend.com).
 * Requires RESEND_API_KEY, DONATION_NOTIFY_EMAIL (recipient), and
 * DONATION_FROM_EMAIL (a sender on a domain verified in Resend).
 */
async function sendEmailNotification(donation) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.DONATION_NOTIFY_EMAIL;
  const from = process.env.DONATION_FROM_EMAIL;
  if (!apiKey || !to || !from) return { skipped: true };

  const amount = formatAmount(donation);
  const text = [
    `Amount:  ${amount}`,
    `Donor:   ${donation.name || '—'} <${donation.email || '—'}>`,
    `When:    ${donation.createdAt}`,
    `Session: ${donation.sessionId}`,
    `Payment: ${donation.paymentIntent || '—'}`,
  ].join('\n');

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: `New donation: ${amount}`, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  return { ok: true };
}

/**
 * Append a donation row to a Google Sheet via a Google Apps Script web app.
 * Requires GOOGLE_SHEET_WEBHOOK_URL (the deployed /exec URL). The script
 * receives the donation object as JSON — see README for the script to paste.
 */
async function appendToSheet(donation) {
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!url) return { skipped: true };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donation),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Sheet webhook ${res.status}: ${body.slice(0, 300)}`);
  }
  return { ok: true };
}

module.exports = { sendEmailNotification, appendToSheet };
