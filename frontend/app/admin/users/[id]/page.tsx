import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

export default async function StaffAccessDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
      actions={
        identity.is_superuser ? (
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${id}/edit`}>
              <Pencil /> Edit access
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="space-y-8">
        {/* Stated where it is noticed. An account can be active, hold a role and
            still be unable to sign in, and nothing on this screen said so. */}
        {!access.user.email ? (
          <p className="rounded-2xl border border-accent-foreground/40 bg-accent/5 px-5 py-4 text-sm">
            <span className="font-semibold">
              {access.user.username} has no work email.
            </span>{' '}
            Sign-in is by @jdiobestem.org address, so this account cannot sign in until one is set.
          </p>
        ) : null}

        {!access.user.has_password ? (
          <p className="rounded-2xl border border-accent-foreground/40 bg-accent/5 px-5 py-4 text-sm">
            <span className="font-semibold">{access.user.username} cannot sign in yet.</span>{' '}
            This account has no password. Open Edit access to set one.
          </p>
        ) : null}

        {/* Read-only here. What somebody may do is worth being able to look up
            without the controls that change it being live under the cursor. */}
        <AccessEditor access={access} canEdit={false} editHref={`/admin/users/${id}/edit`} />
      </div>
    </FormShell>
  );
}
