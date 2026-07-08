const { createCheckoutSession } = require('../../lib/stripeCheckoutSession');
const { mockCheckoutRedirectUrl } = require('../../lib/mockCheckoutUrl');
const { isMockCheckoutEnabled } = require('../../lib/productionCheckout');

function resolveSiteUrl(event) {
  const fromEnv = process.env.PUBLIC_SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');

  const host = event.headers.host || event.headers.Host;
  const proto = (event.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return 'http://localhost:8888';
}

exports.handler = async function (event) {
  const jsonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: jsonHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Invalid JSON' }),
    };
  }

  const amountCents = parseInt(body.amountCents, 10);
  if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 100000000) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Amount must be between $1.00 and $1,000,000.' }),
    };
  }

  const donorName = typeof body.donorName === 'string' ? body.donorName.trim().slice(0, 150) : '';
  const donorEmail = typeof body.donorEmail === 'string' ? body.donorEmail.trim().slice(0, 254) : '';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!donorName) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Please provide your name.' }),
    };
  }
  if (!EMAIL_RE.test(donorEmail)) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Please provide a valid email address.' }),
    };
  }

  const siteUrl = resolveSiteUrl(event);

  if (isMockCheckoutEnabled()) {
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        url: mockCheckoutRedirectUrl(siteUrl, amountCents),
        mock: true,
      }),
    };
  }

  try {
    const session = await createCheckoutSession({ amountCents, siteUrl, donorName, donorEmail });
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    const message =
      err && (err.code === 'MISSING_KEY' || err.code === 'STRIPE_TEST_KEY_IN_PRODUCTION')
        ? err.message
        : 'Unable to start checkout. Please try again later.';
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: message }),
    };
  }
};
