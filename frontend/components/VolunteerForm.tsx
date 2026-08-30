'use client';

import { useState } from 'react';
import Icon from './Icon';
import FieldError from './FieldError';
import { checkField, checkForm, isRequired } from '@/lib/publicForms';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const LABELS: Record<string, string> = {
    name: 'Full name',
    email: 'Email',
    phone: 'Phone',
    interest: 'Area of interest',
    message: 'This',
  };

  /** Check one field as the person leaves it. */
  const blur =
    (field: string) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const message = checkField('volunteer', field, e.target.value, LABELS[field] ?? field);
      setErrors((prev) => {
        const next = { ...prev };
        if (message) next[field] = message;
        else delete next[field];
        return next;
      });
    };

  const invalid = (field: string) => (errors[field] ? ' is-invalid' : '');
  const describe = (field: string) => (errors[field] ? `${field}-error` : undefined);
  const star = (field: string) =>
    isRequired('volunteer', field) ? <span className="field-required">*</span> : null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      phone: String(data.get('phone') ?? '').trim(),
      interest: String(data.get('interest') ?? ''),
      message: String(data.get('message') ?? '').trim(),
    };

    // Checked here rather than by the browser's own bubbles, which show one
    // problem at a time, vanish on the next click, and cannot be styled.
    const found = checkForm('volunteer', payload, LABELS, [], ['phone']);
    if (Object.keys(found).length) {
      setErrors(found);
      setStatus(null);
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setErrors({});

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
      setErrors({});
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
          Full name{star('name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          className={`volunteer-field${invalid('name')}`}
          placeholder="Your name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describe('name')}
          onBlur={blur('name')}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="field-label">
            Email{star('email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className={`volunteer-field${invalid('email')}`}
            placeholder="you@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe('email')}
            onBlur={blur('email')}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
        <PhoneField id="phone" name="phone" label="Phone" />
      </div>
      <div>
        <label htmlFor="interest" className="field-label">
          Area of interest{star('interest')}
        </label>
        <select
          id="interest"
          name="interest"
          required
          className={`volunteer-field${invalid('interest')}`}
          defaultValue=""
          aria-invalid={Boolean(errors.interest)}
          aria-describedby={describe('interest')}
          onBlur={blur('interest')}
        >
          <option value="">Select an area</option>
          <option value="mentorship">Mentorship</option>
          <option value="event">Event organization</option>
          <option value="tutoring">STEM tutoring</option>
          <option value="outreach">Community outreach</option>
          <option value="other">Other</option>
        </select>
        <FieldError id="interest-error" message={errors.interest} />
      </div>
      <div>
        <label htmlFor="message" className="field-label">
          Why do you want to volunteer?{star('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          required
          className={`volunteer-field resize-y${invalid('message')}`}
          placeholder="Tell us about your motivation and experience..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe('message')}
          onBlur={blur('message')}
        ></textarea>
        <FieldError id="message-error" message={errors.message} />
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
