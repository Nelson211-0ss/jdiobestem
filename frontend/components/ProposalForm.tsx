'use client';

import { useState } from 'react';
import Icon from './Icon';
import FieldError from './FieldError';
import { checkField, checkForm, isRequired } from '@/lib/publicForms';

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

function FieldControl({
  field,
  error,
  onCheck,
}: {
  field: Field;
  error?: string;
  onCheck: (name: string, value: string) => void;
}) {
  const id = `pf-${field.name}`;
  // The form insists on a few things the database allows blank — an age, a
  // team size — so the star follows the form's own rule where it is stricter.
  const required = Boolean(field.required) || isRequired('proposal', field.name);
  const common = {
    id,
    name: field.name,
    required: field.required,
    className: `field${error ? ' is-invalid' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : field.hint ? `${id}-hint` : undefined,
    onBlur: (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => onCheck(field.name, e.target.value),
  };

  return (
    <div className={field.half ? 'proposal-field' : 'proposal-field is-full'}>
      <label htmlFor={id} className="field-label">
        {field.label}
        {required ? <span className="field-required">*</span> : null}
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
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export default function ProposalForm() {
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ALL_FIELDS = [...STUDENT_FIELDS, ...PROJECT_FIELDS];
  const LABELS = Object.fromEntries(ALL_FIELDS.map((f) => [f.name, f.label]));
  // Fields this form demands that the model would accept blank.
  const ALSO_REQUIRED = ALL_FIELDS.filter((f) => f.required).map((f) => f.name);

  const checkOne = (name: string, value: string) => {
    const field = ALL_FIELDS.find((f) => f.name === name);
    const message = checkField('proposal', name, value, field?.label ?? name, {
      required: ALSO_REQUIRED.includes(name),
      phone: field?.type === 'tel',
    });
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const data = new FormData(form);
    const payload: Record<string, unknown> = {};
    for (const f of ALL_FIELDS) {
      payload[f.name] = String(data.get(f.name) ?? '').trim();
    }
    payload.projectType = data.getAll('projectType').join(', ');
    payload.declaration = data.get('declaration') === 'on';

    const found = checkForm(
      'proposal',
      Object.fromEntries(ALL_FIELDS.map((f) => [f.name, payload[f.name]])),
      LABELS,
      ALSO_REQUIRED,
      ALL_FIELDS.filter((f) => f.type === 'tel').map((f) => f.name)
    );
    // The serializer refuses a registration without the declaration, so the
    // form should too rather than letting it round-trip to find out.
    if (!payload.declaration) {
      found.declaration = 'Please confirm the declaration before submitting.';
    }
    if (Object.keys(found).length) {
      setErrors(found);
      setStatus(null);
      const first = Object.keys(found)[0];
      document
        .getElementById(first === 'declaration' ? 'pf-declaration' : `pf-${first}`)
        ?.focus();
      return;
    }
    setErrors({});

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
      setErrors({});
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
            <FieldControl key={f.name} field={f} error={errors[f.name]} onCheck={checkOne} />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="proposal-legend">Project information</legend>
        <p className="proposal-legend-note">Workbook Section 3.</p>
        <div className="proposal-grid">
          {PROJECT_FIELDS.map((f) => (
            <FieldControl key={f.name} field={f} error={errors[f.name]} onCheck={checkOne} />
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
          <input
            id="pf-declaration"
            type="checkbox"
            name="declaration"
            required
            aria-invalid={Boolean(errors.declaration)}
            aria-describedby={errors.declaration ? 'pf-declaration-error' : undefined}
            onChange={() =>
              setErrors((prev) => {
                const next = { ...prev };
                delete next.declaration;
                return next;
              })
            }
          />
          <span>
            This is our own original work, and any use of AI tools will be fully declared in
            Section 12 of the workbook.
          </span>
        </label>
        <FieldError id="pf-declaration-error" message={errors.declaration} />
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
