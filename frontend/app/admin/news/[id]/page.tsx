import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import RelatedRecords from '@/components/admin/RelatedRecords';
import ResourceDetail from '@/components/admin/ResourceDetail';
import StoryReading from '@/components/admin/StoryReading';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, relatedFor, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

/**
 * A story as a record, not as a form.
 *
 * Opening a row shows what it holds; changing it is a decision taken by
 * pressing Edit. A story keeps its own editor, so Edit goes there rather than
 * to the generic form.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  if (!identity || !can(identity, 'news', 'view')) notFound();

  const resource = withOptions(RESOURCE_BY_KEY['news'], options);

  let record: Record<string, unknown>;
  try {
    record = await api.get<Record<string, unknown>>(`/admin/news/${id}/`);
  } catch {
    notFound();
  }

  const title = String(record[resource.titleField ?? 'id'] ?? `#${id}`);

  return (
    <FormShell
      backHref="/admin/news"
      backLabel={`Back to ${resource.label.toLowerCase()}`}
      eyebrow={resource.label}
      title={title}
      // How it is being read, and what has been done to it, beside the story
      // rather than after it.
      aside={
        <>
          <StoryReading story={record} />
          {relatedFor('news').map((spec) => (
            <RelatedRecords
              key={`${spec.resource}-${spec.by}`}
              spec={spec}
              id={id}
              identity={identity}
            />
          ))}
        </>
      }
      actions={
        can(identity, 'news', 'change') ? (
          <Button variant="outline" asChild>
            <Link href={`/admin/news/${id}/edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
        ) : null
      }
    >
      <ResourceDetail resource={resource} record={record} />
    </FormShell>
  );
}
