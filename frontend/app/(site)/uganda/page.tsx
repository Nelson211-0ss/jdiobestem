import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import UgandaContent from '@/content/uganda';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Uganda',
  path: '/uganda',
  card: 'uganda',
  description: 'Jdiobe STEM Foundation programs in Uganda: scholarships, hands-on STEM education, mentorship, and student-led innovation.',
});

export default async function Page() {
  const blocks = await getPageBlocks('uganda');
  return <UgandaContent blocks={blocks} />;
}
