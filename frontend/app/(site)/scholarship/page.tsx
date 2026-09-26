import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import ScholarshipContent from '@/content/scholarship';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Scholarship Program',
  path: '/scholarship',
  card: 'scholarship',
});

export default async function Page() {
  const blocks = await getPageBlocks('scholarship');
  return <ScholarshipContent blocks={blocks} />;
}
