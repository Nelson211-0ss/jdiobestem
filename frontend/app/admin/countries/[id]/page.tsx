import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';

import ResourceForm from '@/components/admin/ResourceForm';
import { DetailRow, DetailSection, FormShell } from '@/components/admin/Shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

type Office = {
  id: number;
  name: string;
  city: string;
  is_main: boolean;
  is_active: boolean;
  phone: string;
  email: string;
};

/**
 * A country, with its offices on the same page.
 *
 * They were two separate screens, which meant answering "where do we work from
 * in Uganda?" involved going to one page for the country and another for the
 * offices, filtering it, and holding both in your head. A country's offices are
 * part of what a country *is* here, so they are listed with it — and the main
 * one is marked, because exactly one of them is.
 */
export default async function CountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const identity = await getIdentity();
  if (!identity || !can(identity, 'countries', 'view')) notFound();

  let country: Record<string, unknown>;
  try {
    country = await api.get(`/admin/countries/${id}/`);
  } catch {
    notFound();
  }

  const resource = withOptions(RESOURCE_BY_KEY.countries, await getOptionLists());

  const offices = await api
    .get<{ results?: Office[] }>(`/admin/offices/?country=${id}`)
    .then((r) => r.results ?? [])
    .catch(() => [] as Office[]);

  return (
    <FormShell
      backHref="/admin/countries"
      backLabel="Back to countries"
      eyebrow="Country"
      title={String(country.name ?? 'Country')}
    >
      <ResourceForm
        resource={resource}
        record={country}
        canChange={can(identity, 'countries', 'change')}
        canDelete={can(identity, 'countries', 'delete')}
      />

      <section className="mt-8 rounded-3xl bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Offices</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Where the Foundation works from in {String(country.name ?? 'this country')}. One is
              the main office.
            </p>
          </div>
          {can(identity, 'offices', 'add') ? (
            <Button asChild variant="outline">
              <Link href={`/admin/offices/new?country=${id}`}>
                <Plus /> Add an office
              </Link>
            </Button>
          ) : null}
        </div>

        {offices.length === 0 ? (
          <p className="mt-6 rounded-md bg-muted px-4 py-3 text-sm">
            No offices recorded here yet.
          </p>
        ) : (
          <div className="mt-6">
            <DetailSection>
              {offices.map((office) => (
                <DetailRow key={office.id} label={office.city || 'Office'}>
                  <span className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/offices/${office.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {office.name}
                    </Link>
                    {office.is_main ? <Badge variant="default">Main</Badge> : null}
                    {!office.is_active ? <Badge variant="secondary">Inactive</Badge> : null}
                    {office.email ? (
                      <span className="font-normal text-muted-foreground">{office.email}</span>
                    ) : null}
                  </span>
                </DetailRow>
              ))}
            </DetailSection>
          </div>
        )}

        {offices.length > 0 && !offices.some((o) => o.is_main) ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-muted px-4 py-3 text-sm">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            None of these is marked as the main office.
          </p>
        ) : null}
      </section>
    </FormShell>
  );
}
