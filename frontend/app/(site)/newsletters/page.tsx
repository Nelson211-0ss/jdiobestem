import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import NewslettersContent from '@/content/newsletters';
import { getPageBlocks, getPublishedNewsletters } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Newsletters',
  path: '/newsletters',
  card: 'newsletters',
  description: 'Read past issues of the Jdiobe STEM Foundation newsletter.',
});

export default async function Page() {
  const [blocks, issues] = await Promise.all([
    getPageBlocks('newsletters'),
    getPublishedNewsletters(),
  ]);
  return <NewslettersContent blocks={blocks} issues={issues} />;
}
