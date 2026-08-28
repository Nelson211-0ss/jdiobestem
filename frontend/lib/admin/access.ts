/** Shapes for the staff access screen. */

export type ActionState = { role: boolean; override: 'allow' | 'deny' | null; effective: boolean };

export type AccessMatrixResource = {
  key: string;
  label: string;
  actions: Record<string, ActionState>;
};

export type AccessPayload = {
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_login: string | null;
  };
  profile: {
    role: string;
    role_display: string;
    country: string;
    country_label: string;
    position: string;
    department: string;
    phone: string;
  };
  matrix: { group: string; resources: AccessMatrixResource[] }[];
  options: {
    roles: { value: string; label: string }[];
    countries: { value: string; label: string }[];
    actions: string[];
  };
  bypasses_policy: boolean;
};

export type OverrideEntry = { resource: string; action: string; effect: 'allow' | 'deny'; reason?: string };
