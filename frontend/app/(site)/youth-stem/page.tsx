import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import YouthStemContent from '@/content/youth-stem';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Youth STEM School Program',
  path: '/youth-stem',
  card: 'youth-stem',
});

export default async function Page() {
  const blocks = await getPageBlocks('youth-stem');
  return <YouthStemContent blocks={blocks} />;
}
