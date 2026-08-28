import type { Metadata } from 'next';

import ScholarshipContent from '@/content/scholarship';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Scholarship Program',
};

export default async function Page() {
  const blocks = await getPageBlocks('scholarship');
  return <ScholarshipContent blocks={blocks} />;
}
