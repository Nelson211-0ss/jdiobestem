'use client';

import { useState } from 'react';
import Icon from './Icon';

/**
 * Contact form.
 *
 * Posts to /api/contact, which stores the message in Postgres and then emails
 * it. It used to compose a `mailto:` and hand off to the visitor's own mail
 * client — which meant a message only arrived if they had one configured and
 * remembered to press send, and nothing was ever recorded either way.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      topic: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? '').trim(),
    };

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) throw new Error(body.error || 'Something went wrong.');
      setSent(true);
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'We could not send that. Please email info@jdiobestem.org.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form id="contact-form" className="mt-8 space-y-5" noValidate onSubmit={onSubmit}>
      <div
        id="form-success"
        className={`${sent ? '' : 'hidden '}rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700`}
        role="status"
      >
        Thank you! Your email client should open with your message ready to send.
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-stone-700">
            Full name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            autoComplete="name"
            className="contact-field"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-stone-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="contact-field"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-stone-700">
          Topic *
        </label>
        <select id="subject" name="subject" required className="contact-field" defaultValue="">
          <option value="">Choose a topic</option>
          <option value="General inquiry">General inquiry</option>
          <option value="Partnership">Partnership &amp; collaboration</option>
          <option value="Volunteering">Volunteering</option>
          <option value="Scholarships">Scholarships &amp; programs</option>
          <option value="Media">Media &amp; press</option>
          <option value="Donations">Donations</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-stone-700">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="contact-field resize-y"
          placeholder="How can we help?"
        ></textarea>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-70 sm:w-auto">
        <Icon name="send" className="h-4 w-4" />
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
