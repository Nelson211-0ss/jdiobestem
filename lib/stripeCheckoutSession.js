const { assertLiveStripeSecretInProduction } = require('./productionCheckout');

/**
 * @param {{ amountCents: number, siteUrl: string }} opts
 */
async function createCheckoutSession(opts) {
  const { amountCents, siteUrl } = opts;
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Server is not configured for payments (missing STRIPE_SECRET_KEY).');
    err.code = 'MISSING_KEY';
    throw err;
  }

  assertLiveStripeSecretInProduction();

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const base = siteUrl.replace(/\/$/, '');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Donation — Jdiobe STEM Foundation',
            description: 'Thank you for supporting STEM education.',
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${base}/donate-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/donate.html`,
  });

  return session;
}

module.exports = { createCheckoutSession };
