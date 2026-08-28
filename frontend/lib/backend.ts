/**
 * Server-side client for the Django backend.
 *
 * The Next.js route handlers are thin proxies now: they forward the request,
 * and the backend owns validation, storage, and the notification email. That
 * keeps one definition of what a valid submission is, and means a submission
 * is written to Postgres before anyone tries to email it.
 *
 * BACKEND_API_KEY is a server-to-server secret. It must never be exposed to the
 * browser, so it is deliberately not a NEXT_PUBLIC_* variable.
 */

const BASE_URL = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const API_KEY = process.env.BACKEND_API_KEY || '';

/** How long to wait before deciding the backend is not going to answer. */
const TIMEOUT_MS = 10_000;

export type BackendResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; error: string };

/** snake_case field name -> something a visitor would recognise. */
function fieldLabel(name: string) {
  return name.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

/**
 * Turn DRF's `{field: ["message"]}` shape into one sentence a visitor can act on.
 *
 * Field-specific errors get their field named, because DRF's default text
 * ("This field may not be blank.") says nothing about which field on a form
 * with nineteen of them.
 */
function firstError(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>;
    const read = (value: unknown) => {
      if (typeof value === 'string' && value.trim()) return value;
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      return '';
    };

    // Non-field messages first: they are already written for a human.
    for (const key of ['detail', 'error', 'non_field_errors']) {
      const message = read(body[key]);
      if (message) return message;
    }
    for (const [key, value] of Object.entries(body)) {
      const message = read(value);
      if (message) return `${fieldLabel(key)}: ${message}`;
    }
  }
  return fallback;
}

export function isBackendConfigured() {
  return Boolean(API_KEY);
}

export async function postToBackend(path: string, body: unknown): Promise<BackendResult> {
  if (!API_KEY) {
    // Fail loudly in the log, politely to the visitor. Accepting a submission
    // that goes nowhere is worse than saying we cannot take it right now.
    console.error(`[backend] BACKEND_API_KEY is not set — ${path} was not sent`);
    return {
      ok: false,
      status: 503,
      error: 'This form is not fully configured yet. Please email info@jdiobestem.org.',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });

    const payload = await res.json().catch(() => ({}));

    if (res.ok) return { ok: true, status: res.status, data: payload };

    if (res.status === 400) {
      return { ok: false, status: 400, error: firstError(payload, 'Please check the form and try again.') };
    }

    // 401/403 means our own key is wrong — a configuration fault, not the
    // visitor's, so it must not be reported back as a validation problem.
    console.error(`[backend] ${path} responded ${res.status}`, payload);
    return {
      ok: false,
      status: 502,
      error: 'We could not process that right now. Please try again shortly.',
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError';
    console.error(`[backend] ${path} ${aborted ? 'timed out' : 'failed'}`, err);
    return {
      ok: false,
      status: 502,
      error: 'We could not process that right now. Please try again shortly.',
    };
  } finally {
    clearTimeout(timer);
  }
}
