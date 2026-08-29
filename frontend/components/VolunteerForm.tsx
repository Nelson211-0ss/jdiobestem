'use client';

import { useState } from 'react';
import Icon from './Icon';
import PhoneField from './PhoneField';

/** Volunteer application form. Posts to /api/volunteer, which relays the
 *  application to the organisation's inbox via Resend. Styled for a light
 *  surface — it sits in a white card at the foot of the volunteer page. */
export default function VolunteerForm() {
  const [status, setStatus] = useState<{
    kind: 'ok' | 'error';
    text: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      interest: String(data.get('interest') ?? ''),
      message: String(data.get('message') ?? '').trim(),
    };

    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) throw new Error(body.error || 'Something went wrong.');
      setStatus({
        kind: 'ok',
        text: 'Thank you. Your application has been sent — we will be in touch.',
      });
      form.reset();
    } catch (err) {
      setStatus({
        kind: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'We could not send your application. Please email info@jdiobestem.org.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form id="volunteer-form" className="space-y-4" noValidate onSubmit={onSubmit}>
      <div>
        <label htmlFor="name" className="field-label">
          Full name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          className="volunteer-field"
          placeholder="Your name"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="field-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className="volunteer-field"
            placeholder="you@email.com"
          />
        </div>
        <PhoneField id="phone" name="phone" label="Phone" />
      </div>
      <div>
        <label htmlFor="interest" className="field-label">
          Area of interest *
        </label>
        <select id="interest" name="interest" required className="volunteer-field" defaultValue="">
          <option value="">Select an area</option>
          <option value="mentorship">Mentorship</option>
          <option value="event">Event organization</option>
          <option value="tutoring">STEM tutoring</option>
          <option value="outreach">Community outreach</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="field-label">
          Why do you want to volunteer? *
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          required
          className="volunteer-field resize-y"
          placeholder="Tell us about your motivation and experience..."
        ></textarea>
      </div>
      <button
        type="submit"
        id="volunteer-submit"
        disabled={sending}
        className="btn-primary w-full disabled:opacity-70"
      >
        {sending ? (
          'Sending...'
        ) : (
          <>
            <Icon name="send" className="h-4 w-4" />
            Submit application
          </>
        )}
      </button>
      <p
        id="volunteer-status"
        role="status"
        aria-live="polite"
        hidden={!status}
        className={
          status ? `proposal-status ${status.kind === 'error' ? 'is-error' : 'is-ok'}` : undefined
        }
      >
        {status?.text}
      </p>
    </form>
  );
}
