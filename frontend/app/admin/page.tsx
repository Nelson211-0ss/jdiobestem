import Link from 'next/link';
import { ArrowRight, Inbox } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, can, getIdentity } from '@/lib/admin/api';
import { RESOURCE_BY_KEY } from '@/lib/admin/resources';
import OperationsMap, { type CountryFigures } from '@/components/admin/OperationsMap';
import AccountingDashboard, { type Accounting } from '@/components/admin/AccountingDashboard';

export const dynamic = 'force-dynamic';

type Stats = {
  inbox: { volunteers: number; contact: number; proposals: number; total: number };
  totals: Record<string, number>;
  giving: { total_cents: number; last_30_cents: number; count: number; count_30: number; currency: string };
  by_country: Omit<CountryFigures, 'schools'>[];
  schools_by_country: Record<string, number>;
  volunteers_by_interest: { interest: string; count: number }[];
  projects_by_stage: { stage: string; count: number }[];
};

function money(cents: number, currency: string) {
  return `${currency} ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

export default async function DashboardPage() {
  const identity = await getIdentity();
  if (!identity) return null;

  const stats = await api.get<Stats>('/stats/');
  const t = stats.totals;

  // The figures come from the Expenses and Gifts & Pledges boards and the
  // donations table, so this is only fetched for someone allowed to see them.
  // A failure here must not take the whole overview down with it.
  const showAccounting = can(identity, 'boards', 'view');
  const accounts = showAccounting
    ? await api.get<Accounting>('/accounting/').catch(() => null)
    : null;

  /** Only the queues this person may actually open. */
  const queues = (
    [
      ['volunteers', 'Volunteer applications', stats.inbox.volunteers],
      ['contact-messages', 'Contact messages', stats.inbox.contact],
      ['proposals', 'Science Fair registrations', stats.inbox.proposals],
    ] as const
  ).filter(([key]) => can(identity, key, 'view'));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good day, {identity.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {identity.position || identity.role_display}
          {identity.country ? ` · ${identity.country_label}` : ' · all countries'}
        </p>
      </div>

      {queues.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Needs attention
            </h2>
            {stats.inbox.total > 0 ? <Badge variant="accent">{stats.inbox.total} new</Badge> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {queues.map(([key, label, count]) => (
              <Link key={key} href={`/admin/${key}`} className="group">
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="flex items-baseline gap-2 text-3xl tabular">
                      {count}
                      <span className="text-sm font-normal text-muted-foreground">new</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {stats.by_country?.length ? (
        <OperationsMap
          countries={stats.by_country.map((c) => ({
            ...c,
            schools: stats.schools_by_country?.[c.code] ?? 0,
          }))}
        />
      ) : null}

      {accounts ? <AccountingDashboard data={accounts} /> : null}

      {can(identity, 'donations', 'view') ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Giving</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Received, all time" value={money(stats.giving.total_cents, stats.giving.currency)} hint={`${stats.giving.count} donations`} />
            <Stat label="Last 30 days" value={money(stats.giving.last_30_cents, stats.giving.currency)} hint={`${stats.giving.count_30} donations`} />
            <Stat label="Newsletter" value={t.subscribers ?? 0} hint="Currently subscribed" />
            <Stat label="Published stories" value={`${t.news_published ?? 0} / ${t.news ?? 0}`} hint="Live on the website" />
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Across the programmes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['mentors', 'Active mentors', t.mentors],
              ['mentees', 'Active mentees', t.mentees],
              ['pairings', 'Active pairings', t.pairings],
              ['projects', 'Science Fair projects', t.projects],
              ['team', 'Team on the website', t.team],
              ['magazine', 'Magazine issues', t.issues],
            ] as const
          )
            .filter(([key]) => can(identity, key, 'view'))
            .map(([key, label, value]) => (
              <Link key={key} href={`/admin/${key}`}>
                <Stat label={label} value={value ?? 0} />
              </Link>
            ))}
        </div>
      </section>

      {stats.volunteers_by_interest.length && can(identity, 'volunteers', 'view') ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Volunteers by area of interest
          </h2>
          <Card>
            <CardContent className="space-y-3 pt-6">
              {stats.volunteers_by_interest.map((row) => {
                const max = Math.max(...stats.volunteers_by_interest.map((r) => r.count), 1);
                const label =
                  RESOURCE_BY_KEY.volunteers.filters?.[1]?.options?.find((o) => o.value === row.interest)?.label ??
                  row.interest;
                return (
                  <div key={row.interest} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-sm">{label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(row.count / max) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm tabular">{row.count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
