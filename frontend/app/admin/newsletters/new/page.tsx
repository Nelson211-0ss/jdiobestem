import { notFound } from 'next/navigation';

import ResourceForm from '@/components/admin/ResourceForm';
import { FormShell } from '@/components/admin/Shell';
import { can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

/**
 * Adding a newsletter: the ordinary resource form, nothing special.
 *
 * This has to exist even though it does what the generic route already does.
 * A static `newsletters/` folder takes precedence over `[resource]/`, so
 * without a `new/` inside it the path falls through to `[id]` and tries to
 * load a newsletter with the id "new".
 *
 * Sending lives on the edit page, because there is nothing to send until the
 * PDF has been attached and saved.
 */
export default async function NewNewsletterPage() {
  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  if (!identity || !can(identity, 'newsletters', 'add')) notFound();

  const resource = withOptions(RESOURCE_BY_KEY.newsletters, options);

  return (
    <FormShell
      backHref="/admin/newsletters"
      backLabel="Back to newsletters"
      eyebrow="New newsletter"
      title="Newsletters"
    >
      <ResourceForm resource={resource} record={null} canChange canDelete={false} />
    </FormShell>
  );
}
