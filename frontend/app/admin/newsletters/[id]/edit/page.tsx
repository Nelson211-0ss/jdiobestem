import { notFound } from 'next/navigation';

import NewsletterActions from '@/components/admin/NewsletterActions';
import ResourceForm from '@/components/admin/ResourceForm';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

/**
 * A newsletter is edited with the ordinary resource form — same fields, same
 * pinned actions, same shape as everything else — with the sending controls
 * added underneath, because those are the part that is genuinely different.
 */
export default async function NewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const identity = await getIdentity();
  if (!identity || !can(identity, 'newsletters', 'view')) notFound();

  let record: Record<string, unknown>;
  try {
    record = await api.get(`/admin/newsletters/${id}/`);
  } catch {
    notFound();
  }

  const resource = withOptions(RESOURCE_BY_KEY.newsletters, await getOptionLists());
  const sentCount = Number(record.sent_count ?? 0);
  // Frozen once anyone has received it: the copy on file has to keep matching
  // the copy in people's inboxes.
  const editable = can(identity, 'newsletters', 'change') && Boolean(record.is_editable);

  return (
    <FormShell
      backHref="/admin/newsletters"
      backLabel="Back to newsletters"
      eyebrow="Newsletter"
      title={String(record.subject ?? 'Untitled')}
    >
      <ResourceForm
        resource={resource}
        record={record}
        canChange={editable}
        canDelete={can(identity, 'newsletters', 'delete') && sentCount === 0}
      />

      <NewsletterActions
        id={Number(record.id)}
        subject={String(record.subject ?? '')}
        status={String(record.status ?? '')}
        statusDisplay={String(record.status_display ?? '')}
        sentCount={sentCount}
        failedCount={Number(record.failed_count ?? 0)}
        hasPdf={Boolean(String(record.pdf ?? '').trim())}
        canSend={can(identity, 'newsletters', 'change')}
      />
    </FormShell>
  );
}
