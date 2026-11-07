import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import ScholarshipContent from '@/content/scholarship';
import { getPageBlocks, getSiteStats } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Scholarship Program',
  path: '/scholarship',
  card: 'scholarship',
});

export default async function Page() {
  const [blocks, stats] = await Promise.all([getPageBlocks('scholarship'), getSiteStats()]);
  const awarded = stats.find((s) => /scholarship/i.test(s.label));
  return <ScholarshipContent blocks={blocks} awarded={awarded} />;
}
