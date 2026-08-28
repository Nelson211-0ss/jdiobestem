import type { Metadata } from 'next';

import YouthStemContent from '@/content/youth-stem';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Youth STEM School Program',
};

export default async function Page() {
  const blocks = await getPageBlocks('youth-stem');
  return <YouthStemContent blocks={blocks} />;
}
