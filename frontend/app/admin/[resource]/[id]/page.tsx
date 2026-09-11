import { notFound } from 'next/navigation';

import Link from 'next/link';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ExportMenu from '@/components/admin/ExportMenu';
import RelatedRecords from '@/components/admin/RelatedRecords';
import ResourceDetail from '@/components/admin/ResourceDetail';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, relatedFor, withOptions } from '@/lib/admin/resources';

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

  // Opening a record shows the record. Editing is a decision, taken by
  // pressing Edit, rather than the state a page happens to open in — which is
  // what put a form in front of anyone who only wanted to read a donation.
  const editable = !resource.readOnly && can(identity, key, 'change');
  const related = relatedFor(key);

  // A full report for this one record: the fields as shown, plus whatever the
  // backend hangs off it — a bursary's payments, a school's projects.
  const exportHref =
    `/api/admin/${key}/${id}/export?title=${encodeURIComponent(resource.singular)}` +
    `&fields=${resource.fields
      .map((f) => `${f.name}:${encodeURIComponent(f.label || f.name)}`)
      .join(',')}`;

  return (
    <FormShell
      backHref={`/admin/${key}`}
      backLabel={`Back to ${resource.label.toLowerCase()}`}
      eyebrow={resource.label}
      title={title}
      // What belongs to this record, read beside it rather than after it, so
      // the next question is answered without scrolling past the whole record.
      aside={
        related.length ? (
          <>
            {related.map((spec) => (
              <RelatedRecords
                key={`${spec.resource}-${spec.by}`}
                spec={spec}
                id={id}
                identity={identity}
              />
            ))}
          </>
        ) : null
      }
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <ExportMenu href={exportHref} label={title} />
          {editable ? (
            <Button variant="outline" asChild>
              <Link href={`/admin/${key}/${id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <ResourceDetail resource={resource} record={record} />
    </FormShell>
  );
}
