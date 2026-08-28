'use client';

import { useState } from 'react';
import Icon from './Icon';

/**
 * Science Fair project registration.
 *
 * Sections 1 and 3 of the Proposal Workbook — student information and project
 * information — plus the declaration. Deliberately not the whole workbook: the
 * full proposal runs to 22 sections and needs a mentor's evaluation, a head
 * teacher's endorsement and a school stamp, so it stays a document. This form
 * registers the project and starts the conversation.
 *
 * Field names and the category list are taken from the workbook, not invented.
 */

const CATEGORIES = [
  'Physical Sciences (Physics, Chemistry, Materials)',
  'Life & Environmental Sciences (Biology, Agriculture, Ecology, Public Health)',
  'Engineering & Technology (Devices, Mechanical/Electrical Systems, Renewable Energy)',
  'Computer Science & Software (Applications, Websites, Data Systems, AI Tools)',
  'Innovation & Entrepreneurship (New Products, Business Models with a Technical Core)',
  'Community & Social Impact Projects',
];

const PROJECT_TYPES = [
  'Research',
  'Engineering',
  'Software',
  'Innovation',
  'Prototype',
  'Community project',
];

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
  hint?: string;
  autoComplete?: string;
  /** Half-width on wider screens. */
  half?: boolean;
};

const STUDENT_FIELDS: Field[] = [
  { name: 'studentName', label: 'Full name', required: true, autoComplete: 'name' },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: ['Female', 'Male', 'Prefer not to say'],
    half: true,
  },
  { name: 'age', label: 'Age', type: 'number', required: true, half: true },
  { name: 'classStream', label: 'Class / Stream', required: true, half: true },
  { name: 'school', label: 'School', required: true, half: true },
  { name: 'district', label: 'District', required: true, half: true },
  { name: 'region', label: 'Region', half: true },
  {
    name: 'studentEmail',
    label: 'Student email',
    type: 'email',
    required: true,
    half: true,
    autoComplete: 'email',
  },
  { name: 'studentPhone', label: 'Student phone', type: 'tel', half: true, autoComplete: 'tel' },
  {
    name: 'guardianContact',
    label: 'Parent / guardian contact',
    required: true,
    half: true,
    hint: 'Name and phone number',
  },
  { name: 'teacherMentor', label: 'Teacher mentor', required: true, half: true },
  { name: 'headTeacher', label: 'Head teacher', half: true },
];

const PROJECT_FIELDS: Field[] = [
  { name: 'projectTitle', label: 'Project title', required: true },
  { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
  { name: 'keywords', label: 'Keywords', half: true, hint: '3–5, separated by commas' },
  {
    name: 'duration',
    label: 'Estimated duration',
    half: true,
    hint: 'For example, 4 months',
  },
  {
    name: 'teamSize',
    label: 'Individual or team',
    type: 'select',
    options: ['Individual project', 'Team project'],
    required: true,
    half: true,
  },
  {
    name: 'summary',
    label: 'What is the problem you want to work on?',
    type: 'textarea',
    required: true,
    hint: 'A few sentences. Who is affected, where, and how you know — you will develop this fully in Section 5 of the workbook.',
  },
];

function FieldControl({ field }: { field: Field }) {
  const id = `pf-${field.name}`;
  const common = {
    id,
    name: field.name,
    required: field.required,
    className: 'field',
    'aria-describedby': field.hint ? `${id}-hint` : undefined,
  };

  return (
    <div className={field.half ? 'proposal-field' : 'proposal-field is-full'}>
      <label htmlFor={id} className="field-label">
        {field.label}
        {field.required ? null : <span className="proposal-optional"> (optional)</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea {...common} rows={4} className="field resize-y" />
      ) : field.type === 'select' ? (
        <select {...common} defaultValue="">
          <option value="">Choose one</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={field.type ?? 'text'}
          autoComplete={field.autoComplete}
          min={field.type === 'number' ? 5 : undefined}
          max={field.type === 'number' ? 30 : undefined}
        />
      )}

      {field.hint ? (
        <p id={`${id}-hint`} className="proposal-hint">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}

export default function ProposalForm() {
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload: Record<string, unknown> = {};
    for (const f of [...STUDENT_FIELDS, ...PROJECT_FIELDS]) {
      payload[f.name] = String(data.get(f.name) ?? '').trim();
    }
    payload.projectType = data.getAll('projectType').join(', ');
    payload.declaration = data.get('declaration') === 'on';

    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/project-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) throw new Error(body.error || 'Something went wrong.');
      setStatus({
        kind: 'ok',
        text: 'Registered. We will be in touch with your teacher mentor about the next step — the full Proposal Workbook.',
      });
      form.reset();
    } catch (err) {
      setStatus({
        kind: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'We could not send your registration. Please email info@jdiobestem.org.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="proposal-form" onSubmit={onSubmit} noValidate>
      <fieldset>
        <legend className="proposal-legend">Student information</legend>
        <p className="proposal-legend-note">
          Workbook Section 1. If this is a team project, the student registering it here should be
          the one we contact; every member completes their own Section 1 in the workbook.
        </p>
        <div className="proposal-grid">
          {STUDENT_FIELDS.map((f) => (
            <FieldControl key={f.name} field={f} />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="proposal-legend">Project information</legend>
        <p className="proposal-legend-note">Workbook Section 3.</p>
        <div className="proposal-grid">
          {PROJECT_FIELDS.map((f) => (
            <FieldControl key={f.name} field={f} />
          ))}

          <div className="proposal-field is-full">
            <span className="field-label">
              Project type<span className="proposal-optional"> (tick all that apply)</span>
            </span>
            <div className="proposal-checks">
              {PROJECT_TYPES.map((t) => (
                <label key={t} className="proposal-check">
                  <input type="checkbox" name="projectType" value={t} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <div className="proposal-declaration">
        <label className="proposal-check">
          <input type="checkbox" name="declaration" required />
          <span>
            This is our own original work, and any use of AI tools will be fully declared in
            Section 12 of the workbook.
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary" disabled={sending}>
          {sending ? (
            'Sending…'
          ) : (
            <>
              <Icon name="send" />
              Register my project
            </>
          )}
        </button>
        <p className="text-sm text-charcoal-500">
          Registering is not the formal submission — the signed workbook is.
        </p>
      </div>

      {status ? (
        <p
          role="status"
          aria-live="polite"
          className={`proposal-status ${status.kind === 'error' ? 'is-error' : 'is-ok'}`}
        >
          {status.text}
        </p>
      ) : null}
    </form>
  );
}
