import { notFound } from 'next/navigation';

import ResourceForm from '@/components/admin/ResourceForm';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  const base = RESOURCE_BY_KEY[key];
  if (!base) notFound();

  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  const resource = withOptions(base, options);
  if (!identity || !can(identity, key, 'view')) notFound();

  let record: Record<string, unknown>;
  try {
    record = await api.get<Record<string, unknown>>(`/admin/${key}/${id}/`);
  } catch {
    // A 404 here is often the country scope doing its job rather than a missing
    // row: the record exists, but not for this person.
    notFound();
  }

  const title = String(record[resource.titleField ?? 'id'] ?? `#${id}`);

  return (
    <FormShell
      backHref={`/admin/${key}`}
      backLabel={`Back to ${resource.label.toLowerCase()}`}
      eyebrow={resource.label}
      title={title}
    >
      <ResourceForm
        resource={resource}
        record={record}
        canChange={can(identity, key, 'change')}
        canDelete={can(identity, key, 'delete')}
      />
    </FormShell>
  );
}
