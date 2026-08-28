import { notFound } from 'next/navigation';

import AccessEditor from '@/components/admin/AccessEditor';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity } from '@/lib/admin/api';
import type { AccessPayload } from '@/lib/admin/access';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const access = await api.get<AccessPayload>(`/admin/users/${id}/access/`);
    return { title: `Access · ${access.user.username}` };
  } catch {
    return { title: 'Staff access' };
  }
}

export default async function StaffAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const identity = await getIdentity();
  if (!identity || !can(identity, 'users', 'view')) notFound();

  let access: AccessPayload;
  try {
    access = await api.get<AccessPayload>(`/admin/users/${id}/access/`);
  } catch {
    notFound();
  }

  const name =
    [access.user.first_name, access.user.last_name].filter(Boolean).join(' ') || access.user.username;

  return (
    <FormShell
      backHref="/admin/users"
      backLabel="Back to staff access"
      eyebrow="Staff access"
      title={name}
    >
      {/* Only a superuser may change access. Everyone who can see the screen
          sees the same truth; the controls are simply inert for them. */}
      <AccessEditor access={access} canEdit={identity.is_superuser} />
    </FormShell>
  );
}
