'use client';

import { useState } from 'react';

import FieldError from './FieldError';
import { checkField, checkForm, isRequired } from '@/lib/publicForms';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const LABELS: Record<string, string> = {
    name: 'Full name',
    email: 'Email',
    subject: 'Topic',
    message: 'Message',
  };

  // The model allows a blank topic; this form has always insisted on one,
  // because it is what routes the message to the right person. The stricter
  // rule is kept and declared here rather than silently starring a field the
  // server would accept empty.
  const ALSO_REQUIRED = ['subject'];

  const blur =
    (field: string) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const message = checkField('contact', field, e.target.value, LABELS[field] ?? field, {
        required: ALSO_REQUIRED.includes(field) || isRequired('contact', field),
      });
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
    ALSO_REQUIRED.includes(field) || isRequired('contact', field) ? (
      <span className="field-required">*</span>
    ) : null;
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      topic: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? '').trim(),
    };

    // `topic` is what the model calls the Topic select; check under the name
    // the form uses so the error lands on the right control.
    const found = checkForm(
      'contact',
      { ...payload, subject: payload.topic },
      LABELS,
      ALSO_REQUIRED
    );
    delete found.topic;
    if (Object.keys(found).length) {
      setErrors(found);
      setError('');
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setErrors({});

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
      setErrors({});
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
            Full name{star('name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            autoComplete="name"
            className={`contact-field${invalid('name')}`}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe('name')}
            onBlur={blur('name')}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-stone-700">
            Email{star('email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className={`contact-field${invalid('email')}`}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe('email')}
            onBlur={blur('email')}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-stone-700">
          Topic{star('subject')}
        </label>
        <select
          id="subject"
          name="subject"
          required
          className={`contact-field${invalid('subject')}`}
          defaultValue=""
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={describe('subject')}
          onBlur={blur('subject')}
        >
          <option value="">Choose a topic</option>
          <option value="General inquiry">General inquiry</option>
          <option value="Partnership">Partnership &amp; collaboration</option>
          <option value="Volunteering">Volunteering</option>
          <option value="Scholarships">Scholarships &amp; programs</option>
          <option value="Media">Media &amp; press</option>
          <option value="Donations">Donations</option>
        </select>
        <FieldError id="subject-error" message={errors.subject} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-stone-700">
          Message{star('message')}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`contact-field resize-y${invalid('message')}`}
          placeholder="How can we help?"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe('message')}
          onBlur={blur('message')}
        ></textarea>
        <FieldError id="message-error" message={errors.message} />
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
