import { notFound } from 'next/navigation';

import ResourceForm from '@/components/admin/ResourceForm';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

export default async function ResourceEditPage({
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

  // Written by the application, never by a person — there is nothing to edit.
  if (resource.readOnly) notFound();
  if (!can(identity, key, 'change')) notFound();

  return (
    <FormShell
      backHref={`/admin/${key}/${id}`}
      backLabel={`Back to ${title}`}
      eyebrow={`Editing · ${resource.label}`}
      title={title}
      // A form with the website beside it needs the room.
      wide={Boolean(resource.preview)}
    >
      <ResourceForm
        resource={resource}
        record={record}
        canChange
        canDelete={can(identity, key, 'delete')}
      />
    </FormShell>
  );
}
