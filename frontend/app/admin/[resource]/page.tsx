import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import DataTable from '@/components/admin/DataTable';
import { ListCard, ListHeader } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists, type Page } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: RESOURCE_BY_KEY[resource]?.label ?? 'Dashboard' };
}

export default async function ResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { resource: key } = await params;
  const base = RESOURCE_BY_KEY[key];
  if (!base) notFound();

  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  const resource = withOptions(base, options);
  if (!identity) return null;

  if (!can(identity, key, 'view')) {
    return (
      <div className="rounded-lg border bg-background p-8 text-center">
        <h1 className="text-lg font-semibold">Not available to your role</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {identity.role_display} does not include access to {resource.label.toLowerCase()}.
        </p>
      </div>
    );
  }

  // Only forward the parameters this resource declares, so a stray query string
  // cannot become an unintended filter on the API.
  const sp = await searchParams;
  const query = new URLSearchParams();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  query.set('page', String(page));
  if (typeof sp.search === 'string' && sp.search) query.set('search', sp.search);
  for (const filter of resource.filters ?? []) {
    const value = sp[filter.name];
    if (typeof value === 'string' && value) query.set(filter.name, value);
  }

  const data = await api.get<Page<Record<string, unknown>>>(`/admin/${key}/?${query.toString()}`);

  return (
    <ListCard>
      <ListHeader
        title={resource.label}
        subtitle={resource.description}
        actions={
          !resource.noCreate && can(identity, key, 'add') ? (
            <Button variant="accent" asChild>
              <Link href={`/admin/${key}/new`}>
                <Plus /> New {resource.singular}
              </Link>
            </Button>
          ) : null
        }
      />

      <DataTable
        resource={resource}
        rows={data.results}
        count={data.count}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </ListCard>
  );
}
