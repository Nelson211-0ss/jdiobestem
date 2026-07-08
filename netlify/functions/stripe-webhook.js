const { handleStripeEvent } = require('../../lib/stripeWebhook');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  if (!signature) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing Stripe-Signature header.' }),
    };
  }

  // Signature verification needs the raw body exactly as sent.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64')
    : event.body || '';

  try {
    await handleStripeEvent({ rawBody, signature });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error('[stripe-webhook]', err && err.message);
    const status = err && err.code === 'BAD_SIGNATURE' ? 400 : 500;
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: (err && err.message) || 'Webhook handler error.' }),
    };
  }
};
