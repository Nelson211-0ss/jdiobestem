import type { Metadata } from 'next';

import NewsContent from '@/content/news';
import { getStories } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'News & Updates',
};

export default async function Page() {
  const stories = await getStories();
  return <NewsContent stories={stories} />;
}
