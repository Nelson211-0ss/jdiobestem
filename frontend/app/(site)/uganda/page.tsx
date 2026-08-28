import type { Metadata } from 'next';

import UgandaContent from '@/content/uganda';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Uganda',
  description:
    'Jdiobe STEM Foundation programs in Uganda: scholarships, hands-on STEM education, mentorship, and student-led innovation.',
};

export default async function Page() {
  const blocks = await getPageBlocks('uganda');
  return <UgandaContent blocks={blocks} />;
}
