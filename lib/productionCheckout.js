/**
 * Production vs local/preview detection for donation checkout.
 * - Netlify production: CONTEXT === 'production'
 * - Any other host: set SITE_ENV=production in the server environment
 */
function isProductionDeploy() {
  if (process.env.SITE_ENV === 'production') return true;
  if (process.env.CONTEXT === 'production') return true;
  return false;
}

/** Mock checkout is never honored on production deploys, even if MOCK_CHECKOUT is set. */
function isMockCheckoutEnabled() {
  if (isProductionDeploy()) return false;
  const v = process.env.MOCK_CHECKOUT;
  return v === '1' || String(v).toLowerCase() === 'true';
}

/**
 * Avoid accepting test Stripe keys when running in production (see isProductionDeploy).
 */
function assertLiveStripeSecretInProduction() {
  if (!isProductionDeploy()) return;
  const key = process.env.STRIPE_SECRET_KEY || '';
  if (!key) return;
  if (key.startsWith('sk_test_')) {
    const err = new Error(
      'This production deploy must use a live Stripe secret key (sk_live_…). Remove sk_test_ keys from production environment variables.'
    );
    err.code = 'STRIPE_TEST_KEY_IN_PRODUCTION';
    throw err;
  }
}

module.exports = {
  isProductionDeploy,
  isMockCheckoutEnabled,
  assertLiveStripeSecretInProduction,
};
