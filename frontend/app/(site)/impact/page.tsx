import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import ImpactContent from '@/content/impact';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Impact',
  path: '/impact',
  card: 'impact',
});

export default async function Page() {
  const blocks = await getPageBlocks('impact');
  return <ImpactContent blocks={blocks} />;
}
