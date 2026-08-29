'use client';

import { useState } from 'react';
import Icon from './Icon';
import FileDropzone from './FileDropzone';
import PhoneField from './PhoneField';
import type { SiteJob } from '@/lib/site-content';

/**
 * Applying for a post.
 *
 * The CV is uploaded first and the form then sends its URL, so a large file
 * never rides inside the application itself and a slow upload cannot silently
 * lose the covering letter somebody just wrote.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function JobApplicationForm({ jobs }: { jobs: SiteJob[] }) {
  const [slug, setSlug] = useState(jobs[0]?.slug ?? '');
  const [cvUrl, setCvUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);


  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    if (!name) return setError('Please enter your full name.');
    if (!EMAIL_RE.test(email)) return setError('Please enter a valid email address.');
    if (!slug) return setError('Please choose the position you are applying for.');

    setBusy(true);
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          email,
          phone: String(data.get('phone') ?? '').trim(),
          cover_letter: String(data.get('cover_letter') ?? '').trim(),
          cv: cvUrl,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.detail ?? 'Your application could not be sent.');
      setDone(true);
      form.reset();
      setCvUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your application could not be sent.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-orange-700">
          <Icon name="check-circle" className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-2xl">Application received</h3>
        <p className="mt-3 text-charcoal-600">
          Thank you. We read every application and will be in touch about the next step.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="job-slug" className="field-label">
          Position *
        </label>
        <select
          id="job-slug"
          className="field"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        >
          {jobs.map((job) => (
            <option key={job.slug} value={job.slug}>
              {job.title}
              {job.office ? ` — ${job.office}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Full name *
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required className="field" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="field"
          />
        </div>
      </div>

      <PhoneField id="phone" name="phone" label="Phone" />

      <div>
        <label htmlFor="cv" className="field-label">
          Your CV
        </label>
        <FileDropzone
          id="cv"
          value={cvUrl}
          onChange={setCvUrl}
          endpoint="/api/careers/cv"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
          supports="PDF, Word, JPG or PNG · up to 15 MB"
        />
      </div>

      <div>
        <label htmlFor="cover_letter" className="field-label">
          Why you, for this post?
        </label>
        <textarea id="cover_letter" name="cover_letter" rows={6} className="field" />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-70">
        <Icon name="send" />
        {busy ? 'Sending…' : 'Send application'}
      </button>
    </form>
  );
}
