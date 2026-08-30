import type { Metadata } from 'next';

import PodcastContent from '@/content/podcast';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Podcast',
  description:
    'The Jdiobe STEM Foundation podcast is on its way. Subscribe to hear when the first episode is out.',
};

export default async function Page() {
  const blocks = await getPageBlocks('podcast');
  return <PodcastContent blocks={blocks} />;
}
