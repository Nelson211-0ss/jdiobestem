const { handleStripeEvent } = require('../lib/stripeWebhook');

// Stripe signature verification requires the raw, unparsed request body, so
// turn off Vercel's automatic body parsing for this function.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe-Signature header.' });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    return res.status(400).json({ error: 'Could not read request body.' });
  }

  try {
    await handleStripeEvent({ rawBody, signature });
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook]', err && err.message);
    // A bad signature is the client's fault (400); everything else is 500 so
    // Stripe retries delivery.
    const status = err && err.code === 'BAD_SIGNATURE' ? 400 : 500;
    return res.status(status).json({ error: (err && err.message) || 'Webhook handler error.' });
  }
};
