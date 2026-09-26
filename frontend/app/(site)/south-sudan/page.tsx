import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import SouthSudanContent from '@/content/south-sudan';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'South Sudan',
  path: '/south-sudan',
  card: 'south-sudan',
  description: 'Jdiobe STEM Foundation programs in South Sudan: expanding access to STEM education, mentorship, and opportunity.',
});

export default async function Page() {
  const blocks = await getPageBlocks('south-sudan');
  return <SouthSudanContent blocks={blocks} />;
}
