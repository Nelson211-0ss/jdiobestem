import { notFound } from 'next/navigation';

import ResourceForm from '@/components/admin/ResourceForm';
import { FormShell } from '@/components/admin/Shell';
import { can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

export default async function ResourceCreatePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const base = RESOURCE_BY_KEY[key];
  if (!base || base.noCreate) notFound();

  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  const resource = withOptions(base, options);
  if (!identity || !can(identity, key, 'add')) notFound();

  return (
    <FormShell
      backHref={`/admin/${key}`}
      backLabel={`Back to ${resource.label.toLowerCase()}`}
      eyebrow={`New ${resource.singular}`}
      title={resource.label}
    >
      <ResourceForm resource={resource} record={null} canChange canDelete={false} />
    </FormShell>
  );
}
