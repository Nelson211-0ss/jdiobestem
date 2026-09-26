import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import NewsContent from '@/content/news';
import { getStories } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'News & Updates',
  path: '/news',
  card: 'news',
});

export default async function Page() {
  const stories = await getStories();
  return <NewsContent stories={stories} />;
}
