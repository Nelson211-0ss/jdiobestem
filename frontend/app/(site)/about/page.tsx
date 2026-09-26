import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import AboutContent from '@/content/about';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'About',
  path: '/about',
  card: 'about',
});

export default async function Page() {
  const blocks = await getPageBlocks('about');
  return <AboutContent blocks={blocks} />;
}
