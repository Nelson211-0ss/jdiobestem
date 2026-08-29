import { notFound } from 'next/navigation';

import ChangePasswordForm from '@/components/admin/ChangePasswordForm';
import { DetailRow, DetailSection, FormShell } from '@/components/admin/Shell';
import { getIdentity } from '@/lib/admin/api';

export const dynamic = 'force-dynamic';

/**
 * Your own account.
 *
 * Deliberately separate from /admin/users, which is for administering other
 * people. Everyone can reach this one; changing somebody else's access stays
 * where it was, behind the permission that governs it.
 */
export default async function AccountPage() {
  const identity = await getIdentity();
  if (!identity) notFound();

  return (
    <FormShell
      backHref="/admin"
      backLabel="Back to overview"
      eyebrow="Your account"
      title={identity.name || identity.username}
    >
      <div className="space-y-10">
        {identity.avatar ? (
          <div className="flex items-center gap-4">
            <img
              src={identity.avatar}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
            <p className="text-sm text-muted-foreground">
              Taken from your profile on the team page, so it is kept in one place.
            </p>
          </div>
        ) : null}

        <DetailSection>
          <DetailRow label="Username">{identity.username}</DetailRow>
          <DetailRow label="Email">{identity.email || '—'}</DetailRow>
          <DetailRow label="Role">{identity.role_display || '—'}</DetailRow>
          <DetailRow label="Countries">{identity.country_label || 'All countries'}</DetailRow>
          {identity.position ? (
            <DetailRow label="Position">{identity.position}</DetailRow>
          ) : null}
        </DetailSection>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Change your password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Changing it signs out every other session. You will stay signed in here.
            </p>
          </div>
          <ChangePasswordForm />
        </section>
      </div>
    </FormShell>
  );
}
