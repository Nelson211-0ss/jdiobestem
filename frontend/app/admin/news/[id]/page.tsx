import { notFound } from 'next/navigation';

import NewsEditor from '@/components/admin/NewsEditor';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity } from '@/lib/admin/api';

export const dynamic = 'force-dynamic';

/** Stories get their own editor rather than the generic resource form. */
export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const identity = await getIdentity();
  if (!identity || !can(identity, 'news', 'view')) notFound();

  let story: Record<string, unknown>;
  try {
    story = await api.get(`/admin/news/${id}/`);
  } catch {
    notFound();
  }

  return (
    <FormShell
      backHref="/admin/news"
      backLabel="Back to news stories"
      eyebrow="News story"
      title={String(story.title ?? 'Untitled')}
      wide
    >
      <NewsEditor
        story={{
          id: Number(story.id),
          title: String(story.title ?? ''),
          slug: String(story.slug ?? ''),
          category: String(story.category ?? ''),
          date: String(story.date ?? ''),
          reading_time: String(story.reading_time ?? ''),
          excerpt: String(story.excerpt ?? ''),
          body: String(story.body ?? ''),
          image: String(story.image ?? ''),
          image_alt: String(story.image_alt ?? ''),
          caption: String(story.caption ?? ''),
          is_published: Boolean(story.is_published),
        }}
        canChange={can(identity, 'news', 'change')}
        canDelete={can(identity, 'news', 'delete')}
      />
    </FormShell>
  );
}
