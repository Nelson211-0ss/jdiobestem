const { createCheckoutSession } = require('../../lib/stripeCheckoutSession');

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

  const siteUrl = resolveSiteUrl(event);

  try {
    const session = await createCheckoutSession({ amountCents, siteUrl });
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    const message =
      err && err.code === 'MISSING_KEY'
        ? err.message
        : 'Unable to start checkout. Please try again later.';
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: message }),
    };
  }
};
