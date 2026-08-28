import { NextResponse } from 'next/server';

import { postToBackend } from '@/lib/backend';

/**
 * Science Fair project registration — a proxy onto the Django backend.
 *
 * This is the online step only. The formal submission remains the signed
 * Proposal Workbook, which needs a mentor's evaluation, a head teacher's
 * endorsement and a school stamp — none of which a web form can carry.
 *
 * Field names are converted from the form's camelCase to the backend's
 * snake_case here, so neither side has to accommodate the other's convention.
 */

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Form field -> model field. The order mirrors the Proposal Workbook. */
const FIELD_MAP: Record<string, string> = {
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
};

/** The form sends the full category label; the backend stores a short key. */
const CATEGORY_KEYS: Record<string, string> = {
  'Physical Sciences': 'physical',
  'Life & Environmental Sciences': 'life',
  'Engineering & Technology': 'engineering',
  'Computer Science & Software': 'software',
  'Innovation & Entrepreneurship': 'innovation',
  'Community & Social Impact Projects': 'community',
};

function categoryKey(label: string) {
  const match = Object.keys(CATEGORY_KEYS).find((prefix) => label.startsWith(prefix));
  return match ? CATEGORY_KEYS[match] : '';
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS });
  }

  const payload: Record<string, unknown> = { declaration: body.declaration === true };
  for (const [formField, modelField] of Object.entries(FIELD_MAP)) {
    payload[modelField] = String(body[formField] ?? '').trim();
  }
  payload.category = categoryKey(String(body.category ?? ''));
  // An empty age would fail an integer column; send null instead.
  payload.age = payload.age === '' ? null : payload.age;

  const result = await postToBackend('/project-proposals/', payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status, headers: CORS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS });
}
