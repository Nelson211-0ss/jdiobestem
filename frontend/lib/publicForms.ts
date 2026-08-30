/**
 * What the website's forms are called, and what the server calls them.
 *
 * The browser validates against the same contract the serializer enforces, and
 * that contract is keyed by the model's field names. Where a form uses its own
 * wording — `subject` for what the model calls `topic`, camelCase across the
 * Science Fair registration — the two are reconciled here, once, rather than
 * in each form and again in each API route.
 */

import { specFor, validatePhone, validateValue } from '@/lib/validation';

export type PublicForm = 'volunteer' | 'contact' | 'newsletter' | 'proposal' | 'job-application';

/**
 * Form field -> model field, for the forms whose names differ.
 * The Science Fair order mirrors the Proposal Workbook.
 */
export const FIELD_MAPS: Record<string, Record<string, string>> = {
  contact: { subject: 'topic' },
  proposal: {
    studentName: 'student_name',
    gender: 'gender',
    age: 'age',
    classStream: 'class_stream',
    school: 'school',
    district: 'district',
    region: 'region',
    studentEmail: 'student_email',
    studentPhone: 'student_phone',
    guardianContact: 'guardian_contact',
    teacherMentor: 'teacher_mentor',
    headTeacher: 'head_teacher',
    projectTitle: 'project_title',
    category: 'category',
    projectType: 'project_type',
    keywords: 'keywords',
    duration: 'duration',
    teamSize: 'team_size',
    summary: 'summary',
  },
};

/** The model's name for a form field. Most are already the same. */
export function modelName(form: PublicForm, field: string): string {
  return FIELD_MAPS[form]?.[field] ?? field;
}

/** Does the server insist on this field? */
export function isRequired(form: PublicForm, field: string): boolean {
  return Boolean(specFor('public', form, modelName(form, field)).required);
}

/**
 * Check one field the way the server will.
 *
 * Phone numbers are checked separately: the model stores them as a plain
 * CharField, so the contract has nothing to say about their shape, but a
 * number too short to dial is still worth catching before it is submitted.
 */
export function checkField(
  form: PublicForm,
  field: string,
  value: unknown,
  label: string,
  opts: { required?: boolean; phone?: boolean } = {}
): string {
  if (opts.phone) {
    return validatePhone(String(value ?? ''), opts.required ?? isRequired(form, field));
  }
  const spec = { ...specFor('public', form, modelName(form, field)) };
  // A form may ask for more than the database insists on — the Science Fair
  // registration wants an age even though the column allows blank.
  if (opts.required) spec.required = true;
  return validateValue(spec, value, label);
}

/**
 * Check a whole submission, keyed by the form's own field names.
 *
 * `required` lists any field the form demands beyond the server's own rules,
 * so the two can differ without the stricter one being lost.
 */
export function checkForm(
  form: PublicForm,
  values: Record<string, unknown>,
  labels: Record<string, string>,
  required: string[] = [],
  phones: string[] = []
): Record<string, string> {
  const errors: Record<string, string> = {};
  const names = new Set([...Object.keys(values), ...Object.keys(labels)]);

  for (const field of names) {
    const message = checkField(form, field, values[field], labels[field] ?? field, {
      required: required.includes(field) || isRequired(form, field),
      phone: phones.includes(field),
    });
    if (message) errors[field] = message;
  }
  return errors;
}
