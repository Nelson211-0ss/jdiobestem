const { assertLiveStripeSecretInProduction } = require('./productionCheckout');

/**
 * @param {{ amountCents: number, siteUrl: string, donorName?: string, donorEmail?: string }} opts
 */
async function createCheckoutSession(opts) {
  const { amountCents, siteUrl, donorName, donorEmail } = opts;
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Server is not configured for payments (missing STRIPE_SECRET_KEY).');
    err.code = 'MISSING_KEY';
    throw err;
  }

  assertLiveStripeSecretInProduction();

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const base = siteUrl.replace(/\/$/, '');

  const metadata = {};
  if (donorName) metadata.donor_name = donorName;
  if (donorEmail) metadata.donor_email = donorEmail;

  const params = {
    mode: 'payment',
    submit_type: 'donate',
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
    // Prefill the donor's email in Checkout so their receipt goes to the right place.
    ...(donorEmail ? { customer_email: donorEmail } : {}),
    // Keep the donor's typed name/email on both the session and the payment, and
    // have Stripe email the donor its official payment receipt.
    metadata,
    payment_intent_data: {
      metadata,
      ...(donorEmail ? { receipt_email: donorEmail } : {}),
    },
    success_url: `${base}/donate-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/donate`,
  };

  const session = await stripe.checkout.sessions.create(params);

  return session;
}

module.exports = { createCheckoutSession };
