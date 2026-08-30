import { getSessionToken } from './session';

/**
 * Server-side client for the dashboard API.
 *
 * Every call carries the signed-in staff member's token, so the backend applies
 * that person's role and country scope. The dashboard never asks for "all
 * mentees" — it asks for mentees, and gets the ones this person may see.
 */

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export type Identity = {
  id: number;
  username: string;
  email: string;
  name: string;
  is_superuser: boolean;
  role: string;
  role_display: string;
  country: string;
  country_label: string;
  position: string;
  department: string;
  /** Photograph from the person's team profile, if they have one. */
  avatar: string;
  /** resource -> allowed actions. Drives what the interface offers. */
  permissions: Record<string, string[]>;
};

export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: unknown = null
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getSessionToken();
  if (!token) throw new ApiError(401, 'Not signed in.');

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      (body && typeof body === 'object' && 'detail' in body && String(body.detail)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, body);
  }
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};

/** The signed-in staff member, or null if the token is missing or stale. */
export async function getIdentity(): Promise<Identity | null> {
  try {
    return await api.get<Identity>('/auth/me/');
  } catch {
    return null;
  }
}

export function can(identity: Identity | null, resource: string, action: string) {
  return Boolean(identity?.permissions?.[resource]?.includes(action));
}

export type OptionLists = {
  countries: { value: string; label: string }[];
  staff_scopes: { value: string; label: string }[];
  currencies: { value: string; label: string }[];
  offices: { value: string; label: string; country: string; is_main: boolean }[];
  /** Row ids from the countries table, for fields that reference it. */
  countryIds: { value: string; label: string }[];
  /** Documents an edition can belong to. */
  documents: { value: string; label: string }[];
  /** Staff accounts, for fields that name a responsible person. */
  staff: { value: string; label: string }[];
  /** Student projects an award can belong to. */
  projects: { value: string; label: string }[];
  /** Bursaries a payment can belong to. */
  scholarships: { value: string; label: string }[];
};

/**
 * The choice lists that come from data rather than code — countries and their
 * currencies. Fetched per render so adding a country in the dashboard shows up
 * in every select without a deploy.
 */
export async function getOptionLists(): Promise<OptionLists> {
  try {
    const lists = await api.get<Omit<OptionLists, 'countryIds'>>('/admin/options/');
    const rows = await api
      .get<{ results: { id: number; name: string }[] }>('/admin/countries/')
      .catch(() => ({ results: [] }));
    return {
      ...lists,
      countryIds: rows.results.map((c) => ({ value: String(c.id), label: c.name })),
    };
  } catch {
    return {
      countries: [], staff_scopes: [], currencies: [], offices: [],
      countryIds: [], documents: [], staff: [], projects: [], scholarships: [],
    };
  }
}
