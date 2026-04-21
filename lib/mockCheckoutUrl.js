/**
 * Local / offline testing: redirect target that skips Stripe Checkout.
 * @param {string} siteUrl
 * @param {number} amountCents
 */
function mockCheckoutRedirectUrl(siteUrl, amountCents) {
  const base = String(siteUrl || '').replace(/\/$/, '');
  const qs = `mock=1&amount_cents=${encodeURIComponent(String(amountCents))}`;
  return `${base}/donate-success.html?${qs}`;
}

module.exports = { mockCheckoutRedirectUrl };
