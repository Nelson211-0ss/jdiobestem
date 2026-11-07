import { notFound } from 'next/navigation';

import NewAccountForm, { type NewAccountOptions } from '@/components/admin/NewAccountForm';
import { FormShell } from '@/components/admin/Shell';
import { api, getIdentity } from '@/lib/admin/api';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'New account' };

/**
 * Give a colleague an account.
 *
 * Its own page rather than the generic resource form: an account needs a role
 * and a scope from the start, and the generic form could only make a Viewer
 * with no password — which nobody could use until somebody remembered to fix
 * both. Linked from the accounts list and from a team member's record, which
 * passes `?member=` so the person is already chosen.
 */
export default async function NewAccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const identity = await getIdentity();
  if (!identity || !identity.is_superuser) notFound();

  const sp = await searchParams;
  const member = typeof sp.member === 'string' ? sp.member : '';

  let options: NewAccountOptions;
  try {
    options = await api.get<NewAccountOptions>('/admin/staff-accounts/');
  } catch {
    notFound();
  }

  return (
    <FormShell title="New account">
      <NewAccountForm options={options} memberId={member} />
    </FormShell>
  );
}
