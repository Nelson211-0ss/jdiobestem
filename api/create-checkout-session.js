const { createCheckoutSession } = require('../lib/stripeCheckoutSession');
const { mockCheckoutRedirectUrl } = require('../lib/mockCheckoutUrl');
const { isMockCheckoutEnabled } = require('../lib/productionCheckout');

function resolveSiteUrl(req) {
  const fromEnv =
    process.env.PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    process.env.DEPLOY_URL ||
    null;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');

  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return 'http://localhost:3000';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  if (!body || typeof body !== 'object') {
    body = {};
  }

  const amountCents = parseInt(body.amountCents, 10);
  if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 100000000) {
    return res.status(400).json({ error: 'Amount must be between $1.00 and $1,000,000.' });
  }

  const siteUrl = resolveSiteUrl(req);

  if (isMockCheckoutEnabled()) {
    return res.status(200).json({
      url: mockCheckoutRedirectUrl(siteUrl, amountCents),
      mock: true,
    });
  }

  try {
    const session = await createCheckoutSession({ amountCents, siteUrl });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    const message =
      err && (err.code === 'MISSING_KEY' || err.code === 'STRIPE_TEST_KEY_IN_PRODUCTION')
        ? err.message
        : 'Unable to start checkout. Please try again later.';
    return res.status(500).json({ error: message });
  }
};
