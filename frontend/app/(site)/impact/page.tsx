import type { Metadata } from 'next';

import ImpactContent from '@/content/impact';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Impact',
};

export default async function Page() {
  const blocks = await getPageBlocks('impact');
  return <ImpactContent blocks={blocks} />;
}
