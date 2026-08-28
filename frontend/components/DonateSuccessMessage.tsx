'use client';

import { useEffect, useState } from 'react';

const DEFAULT_MESSAGE = 'Your payment was submitted successfully. Stripe will email you a receipt.';

/**
 * Body copy for /donate-success.
 *
 * Normally the Stripe confirmation line. When the donate form's localhost-only
 * practice mode sent the visitor here with `?mock=1`, say plainly that nothing
 * was charged — and if that URL is opened anywhere but localhost, say so rather
 * than implying a payment happened.
 */
export default function DonateSuccessMessage() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock') !== '1') return;

    const host = window.location.hostname;
    const local = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    if (!local) {
      setMessage(
        'This address is only for local testing. No payment was processed. To donate, use the Donate page and complete checkout on the live site.'
      );
      return;
    }

    const cents = Number.parseInt(params.get('amount_cents') ?? '', 10);
    let amountLine = '';
    if (Number.isFinite(cents) && cents > 0) {
      const dollars = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
      amountLine = ` (practice amount: $${dollars})`;
    }
    setMessage(
      `This was a local practice run — no card was charged and no money moved.${amountLine} For a real donation, use the deployed site with Stripe checkout.`
    );
  }, []);

  return (
    <p id="donate-success-body" className="page-hero__lede mx-auto">
      {message}
    </p>
  );
}
