import type { Metadata } from 'next';

import NewslettersContent from '@/content/newsletters';
import { getPageBlocks, getPublishedNewsletters } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Newsletters',
  description: 'Read past issues of the Jdiobe STEM Foundation newsletter.',
};

export default async function Page() {
  const [blocks, issues] = await Promise.all([
    getPageBlocks('newsletters'),
    getPublishedNewsletters(),
  ]);
  return <NewslettersContent blocks={blocks} issues={issues} />;
}
