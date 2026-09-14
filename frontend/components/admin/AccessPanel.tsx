import Link from 'next/link';
import { KeyRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { can, type Identity } from '@/lib/admin/api';

/**
 * What a colleague's login lets them do, read on their own record.
 *
 * A person and their dashboard account were two records that happened to share
 * a name: the team page said what somebody does, Staff access said what they
 * may open, and neither mentioned the other. Answering "what can Sheilah see"
 * meant knowing both screens existed.
 *
 * Read here, changed there. Granting access is a different permission from
 * editing a colleague's job title, and a panel that could raise somebody's own
 * role would dissolve that — so this shows the answer and offers the way to
 * the form, to whoever is allowed to use it.
 */
export default function AccessPanel({
  record,
  identity,
}: {
  record: Record<string, unknown>;
  identity: Identity;
}) {
  const account = record.account;
  const name = String(record.name ?? 'This colleague');

  if (!account) {
    return (
      <section className="rounded-2xl border border-border/40 bg-card p-5">
        <h2 className="px-1 text-sm font-semibold tracking-tight">Dashboard access</h2>
        <p className="mt-2 px-1 text-sm text-muted-foreground">
          {name} has no account, so cannot sign in.
        </p>
        {can(identity, 'users', 'add') ? (
          <div className="mt-3 px-1">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/users/new">
                <KeyRound /> Give them an account
              </Link>
            </Button>
          </div>
        ) : null}
      </section>
    );
  }

  const canSignIn = Boolean(record.account_can_sign_in);
  const lastLogin = record.account_last_login ? String(record.account_last_login) : '';

  const rows: [string, React.ReactNode][] = [
    [
      'Can sign in',
      <Badge key="s" variant={canSignIn ? 'secondary' : 'outline'}>
        {canSignIn ? 'Yes' : 'No password set'}
      </Badge>,
    ],
    ['Role', String(record.account_role || '—')],
    ['Sees', String(record.account_country || '—')],
    ['Signs in as', String(record.account_email || '—')],
    [
      'Last signed in',
      lastLogin
        ? new Date(lastLogin).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'Never',
    ],
  ];

  return (
    <section className="rounded-2xl border border-border/40 bg-card p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 px-1">
        <h2 className="text-sm font-semibold tracking-tight">Dashboard access</h2>
        <p className="text-xs text-muted-foreground">What their login lets them open</p>
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 px-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="min-w-0">{value}</dd>
          </div>
        ))}
      </dl>

      {can(identity, 'users', 'change') ? (
        <div className="mt-3 px-1">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${String(account)}`}>
              <KeyRound /> Change what they can see
            </Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
