import type { Metadata } from 'next';

import AboutContent from '@/content/about';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'About',
};

export default async function Page() {
  const blocks = await getPageBlocks('about');
  return <AboutContent blocks={blocks} />;
}
