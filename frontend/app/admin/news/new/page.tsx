import { notFound } from 'next/navigation';

import NewsEditor from '@/components/admin/NewsEditor';
import { FormShell } from '@/components/admin/Shell';
import { can, getIdentity } from '@/lib/admin/api';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New story' };

export default async function NewStoryPage() {
  const identity = await getIdentity();
  if (!identity || !can(identity, 'news', 'add')) notFound();

  return (
    <FormShell
      backHref="/admin/news"
      backLabel="Back to news stories"
      eyebrow="New story"
      title="Write a story"
      wide
    >
      <NewsEditor story={null} canChange canDelete={false} />
    </FormShell>
  );
}
