import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ResourceDetail from '@/components/admin/ResourceDetail';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

/**
 * A newsletter as a record, not as a form.
 *
 * Opening a row shows what it holds; changing it is a decision taken by
 * pressing Edit. A newsletter keeps its own editor, so Edit goes there rather than
 * to the generic form.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  if (!identity || !can(identity, 'newsletters', 'view')) notFound();

  const resource = withOptions(RESOURCE_BY_KEY['newsletters'], options);

  let record: Record<string, unknown>;
  try {
    record = await api.get<Record<string, unknown>>(`/admin/newsletters/${id}/`);
  } catch {
    notFound();
  }

  const title = String(record[resource.titleField ?? 'id'] ?? `#${id}`);

  return (
    <FormShell
      backHref="/admin/newsletters"
      backLabel={`Back to ${resource.label.toLowerCase()}`}
      eyebrow={resource.label}
      title={title}
      actions={
        can(identity, 'newsletters', 'change') ? (
          <Button variant="outline" asChild>
            <Link href={`/admin/newsletters/${id}/edit`}>
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
