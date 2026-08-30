'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import FieldError from './FieldError';
import { formatMoney, toNumber } from '@/lib/format';
import { useGroupedNumber } from '@/lib/useGroupedNumber';
import { validateValue } from '@/lib/validation';

/**
 * Donation form. Collects donor details and an amount, then asks
 * /api/create-checkout-session for a Stripe Checkout URL and redirects there.
 *
 * Laid out the way the reference design lays it out: the amount is the first
 * thing you touch, as a row of chips with a "more" chip that opens the custom
 * field, then who you are, then the total and one full-width submit.
 *
 * The practice mode from the static build is preserved: on localhost only, with
 * `?mock_checkout=1` or `localStorage.jdiobe_donate_mock === '1'`, the submit
 * skips Stripe and goes straight to /donate-success in mock form. The server
 * enforces the same restriction independently — this is a convenience, not the
 * security boundary.
 */

const CHECKOUT_API = '/api/create-checkout-session';
const PRESET_AMOUNTS = [25, 50, 100, 250];

function isLocalDevHost() {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

function formatTotal(amount: number) {
  if (!amount || !Number.isFinite(amount)) return formatMoney(0, 'USD');
  return formatMoney(amount, 'USD');
}

export default function DonateForm() {
  const [mockMode, setMockMode] = useState(false);
  const [preset, setPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; amount?: string }>({});

  // The custom amount is grouped as it is typed, and held as a plain number.
  const customField = useGroupedNumber(custom, (raw) => {
    setCustom(raw);
    setPreset(null);
    setError('');
    setErrors((prev) => ({ ...prev, amount: undefined }));
  });
  const customRef = customField.ref;

  useEffect(() => {
    if (!isLocalDevHost()) return;
    const params = new URLSearchParams(window.location.search);
    const stored = (() => {
      try {
        return window.localStorage.getItem('jdiobe_donate_mock');
      } catch {
        return null;
      }
    })();
    setMockMode(params.get('mock_checkout') === '1' || stored === '1');
  }, []);

  // A preset and a custom entry are mutually exclusive; whichever was touched
  // last is the amount.
  const amount = custom !== '' ? (toNumber(custom) ?? 0) : (preset ?? 0);
  const total = Number.isFinite(amount) ? amount : 0;

  // The custom field stays on screen once it holds a value, so an amount can
  // never be hidden behind a disclosure the donor has forgotten about.
  const showCustom = customOpen || custom !== '';

  const openCustom = () => {
    setCustomOpen(true);
    setPreset(null);
    setError('');
    window.requestAnimationFrame(() => customRef.current?.focus());
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const donorName = String(data.get('donor-name') ?? '').trim();
    const donorEmail = String(data.get('donor-email') ?? '').trim();

    const found: { name?: string; email?: string; amount?: string } = {};
    const nameProblem = validateValue({ required: true, kind: 'text' }, donorName, 'Full name');
    if (nameProblem) found.name = nameProblem;
    const emailProblem = validateValue(
      { required: true, kind: 'email' },
      donorEmail,
      'Email address'
    );
    if (emailProblem) found.email = emailProblem;
    if (!total || total < 1) {
      found.amount = 'Choose or enter a donation of at least $1.';
    }

    if (Object.keys(found).length) {
      setErrors(found);
      setError('');
      const firstId = found.amount ? 'custom-amount' : found.name ? 'donor-name' : 'donor-email';
      if (found.amount) setCustomOpen(true);
      form.querySelector<HTMLInputElement>(`#${firstId}`)?.focus();
      return;
    }
    setErrors({});

    const amountCents = Math.round(total * 100);
    setSubmitting(true);

    try {
      if (mockMode) {
        window.location.href = `/donate-success?mock=1&amount_cents=${encodeURIComponent(
          String(amountCents),
        )}`;
        return;
      }

      const res = await fetch(CHECKOUT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents, donorName, donorEmail }),
      });
      const payload = await res.json().catch(() => ({}) as { url?: string; error?: string });
      if (!res.ok) throw new Error(payload.error || 'Could not start secure checkout.');
      if (!payload.url) throw new Error('No checkout URL returned.');
      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="donation-form" className="mt-9 max-w-xl" onSubmit={onSubmit}>
      <div
        id="donate-mock-banner"
        className={`${mockMode ? '' : 'hidden '}mb-6 rounded-xl bg-cream-200 px-4 py-3 text-sm text-charcoal-800`}
        role="status"
      >
        <strong className="font-semibold">Local practice mode.</strong> No card charge. Remove{' '}
        <code className="rounded bg-cream-300/80 px-1 text-xs">?mock_checkout=1</code> and{' '}
        <code className="rounded bg-cream-300/80 px-1 text-xs">
          localStorage jdiobe_donate_mock
        </code>{' '}
        to test real Stripe checkout. (Only available on{' '}
        <code className="rounded bg-cream-300/80 px-1 text-xs">localhost</code>.)
      </div>

      {/* Amount — the first decision, the way the reference orders it. */}
      <fieldset className="amount-fieldset">
        <legend className="field-label">Choose an amount</legend>
        <div className="amount-row">
          {PRESET_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={custom === '' && preset === value}
              className={`amount-chip${custom === '' && preset === value ? ' is-selected' : ''}`}
              onClick={() => {
                setPreset(value);
                setCustom('');
                setCustomOpen(false);
                setError('');
              }}
            >
              {`$${value}`}
            </button>
          ))}
          <button
            type="button"
            aria-expanded={showCustom}
            aria-controls="custom-amount"
            aria-label="Enter another amount"
            className={`amount-chip amount-chip-more${custom !== '' ? ' is-selected' : ''}`}
            onClick={openCustom}
          >
            <span aria-hidden="true">&middot;&middot;&middot;</span>
          </button>
        </div>
      </fieldset>

      <div className={showCustom ? 'mt-4' : 'hidden'}>
        <label htmlFor="custom-amount" className="field-label">
          Another amount
        </label>
        <div className="donate-field-icon">
          <Icon name="dollar-sign" />
          <input
            {...customField}
            id="custom-amount"
            name="custom-amount"
            placeholder="0"
            autoComplete="transaction-amount"
            className={`field${errors.amount ? ' is-invalid' : ''}`}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'custom-amount-error' : undefined}
            onBlur={customField.commit}
          />
        </div>
        <FieldError id="custom-amount-error" message={errors.amount} />
        <p className="donate-hint">Minimum $1 &middot; decimals allowed</p>
      </div>

      {/* Donor details */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="donor-name" className="field-label">
            Full name<span className="field-required">*</span>
          </label>
          <div className="donate-field-icon">
            <Icon name="user" />
            <input
              id="donor-name"
              name="donor-name"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              required
              className={`field${errors.name ? ' is-invalid' : ''}`}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'donor-name-error' : undefined}
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  name: validateValue({ required: true, kind: 'text' }, e.target.value, 'Full name'),
                }))
              }
            />
          </div>
          <FieldError id="donor-name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="donor-email" className="field-label">
            Email address<span className="field-required">*</span>
          </label>
          <div className="donate-field-icon">
            <Icon name="mail" />
            <input
              id="donor-email"
              name="donor-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@email.com"
              required
              className={`field${errors.email ? ' is-invalid' : ''}`}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'donor-email-error' : undefined}
              onBlur={(e) =>
                setErrors((prev) => ({
                  ...prev,
                  email: validateValue(
                    { required: true, kind: 'email' },
                    e.target.value,
                    'Email address'
                  ),
                }))
              }
            />
          </div>
          <FieldError id="donor-email-error" message={errors.email} />
        </div>
      </div>
      <p className="donate-hint">We&apos;ll email your receipt &mdash; never shared.</p>

      <div className="donate-total mt-6">
        <span className="text-sm font-bold text-charcoal-700">Total</span>
        <span id="donation-total" className="text-2xl font-extrabold tabular-nums text-orange-700">
          {formatTotal(total)}
        </span>
      </div>

      <p
        id="donate-error"
        className={`${error ? '' : 'hidden '}mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800`}
        role="alert"
      >
        {error}
      </p>

      <button
        type="submit"
        id="donate-submit"
        disabled={submitting}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        <Icon name="heart" />
        Donate now
      </button>

      <p
        id="donate-trust-line"
        className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium text-charcoal-500"
      >
        <Icon name="lock" className="h-4 w-4 text-green-700" />
        <span id="donate-trust-text">
          {mockMode ? 'Practice mode — no payment processed.' : 'Encrypted checkout with Stripe'}
        </span>
      </p>
    </form>
  );
}
