import { notFound } from 'next/navigation';

import ResourceForm from '@/components/admin/ResourceForm';
import { FormShell } from '@/components/admin/Shell';
import { can, getIdentity, getOptionLists } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, withOptions } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

/**
 * Adding a country.
 *
 * Needed even though the generic route would do the same job: a static
 * `countries/` folder outranks `[resource]/`, so without this `new` falls
 * through to `[id]` and tries to load a country with the id "new".
 */
export default async function NewCountryPage() {
  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  if (!identity || !can(identity, 'countries', 'add')) notFound();

  return (
    <FormShell
      backHref="/admin/countries"
      backLabel="Back to countries"
      eyebrow="New country"
      title="Countries"
    >
      <ResourceForm
        resource={withOptions(RESOURCE_BY_KEY.countries, options)}
        record={null}
        canChange
        canDelete={false}
      />
    </FormShell>
  );
}
