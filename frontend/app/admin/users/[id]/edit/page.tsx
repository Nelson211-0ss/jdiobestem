import { notFound } from 'next/navigation';

import AccessEditor from '@/components/admin/AccessEditor';
import SetPasswordCard from '@/components/admin/SetPasswordCard';
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
  // Only a superuser may change access; for anyone else this page does not
  // exist rather than existing and refusing.
  if (!identity || !identity.is_superuser) notFound();

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
      backHref={`/admin/users/${id}`}
      backLabel={`Back to ${name}`}
      eyebrow="Editing · Staff access"
      title={name}
    >
      <div className="space-y-8">
        {/* Above the access form on purpose: activating an account without a
            password achieves nothing, and this is the half that was missing. */}
        <SetPasswordCard
          userId={access.user.id}
          username={access.user.username}
          hasPassword={access.user.has_password}
          isActive={access.user.is_active}
        />
        <AccessEditor access={access} canEdit />
      </div>
    </FormShell>
  );
}
