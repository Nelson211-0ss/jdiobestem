'use client';

import { useState } from 'react';
import Icon from './Icon';

/**
 * Email signup. Posts to /api/newsletter, which adds the address to the Resend
 * audience when one is configured and otherwise relays the signup to the
 * organisation's inbox.
 *
 * Shared by the footer newsletter and the magazine alert list; `source` is what
 * tells the two apart on the receiving end.
 */
export default function NewsletterForm({
  source = 'newsletter',
  label = 'Sign up for the newsletter — programs, student stories, and ways to help.',
  cta = 'Sign up',
  doneMessage = "You're on the list. Thank you — we'll be in touch.",
  id = 'newsletter-email',
  tone = 'dark',
}: {
  source?: string;
  label?: string;
  cta?: string;
  doneMessage?: string;
  id?: string;
  /** `dark` for the charcoal footer, `light` for a cream or white surface. */
  tone?: 'dark' | 'light';
} = {}) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email address.');
      return;
    }

    setState('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, source }),
      });
      const body = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) throw new Error(body.error || 'Something went wrong.');
      setState('done');
      setEmail('');
    } catch (err) {
      setState('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (state === 'done') {
    return (
      <p
        className={`mt-5 flex items-start gap-2.5 text-sm font-semibold ${
          tone === 'dark' ? 'text-white' : 'text-charcoal-900'
        }`}
        role="status"
        aria-live="polite"
      >
        <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
        {doneMessage}
      </p>
    );
  }

  return (
    <form className="mt-5 w-full max-w-md" onSubmit={onSubmit} noValidate>
      <label
        htmlFor={id}
        className={`mb-2 block text-sm ${tone === 'dark' ? 'text-white/70' : 'text-charcoal-600'}`}
      >
        {label}
      </label>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          id={id}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={tone === 'dark' ? 'newsletter-field' : 'field'}
        />
        <button type="submit" className="btn-primary shrink-0" disabled={state === 'sending'}>
          {state === 'sending' ? 'Signing up…' : cta}
        </button>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          className={`mt-2 text-sm font-semibold ${
            tone === 'dark' ? 'text-orange-300' : 'text-red-600'
          }`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
