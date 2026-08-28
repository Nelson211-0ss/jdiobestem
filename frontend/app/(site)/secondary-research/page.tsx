import type { Metadata } from 'next';

import SecondaryResearchContent from '@/content/secondary-research';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Secondary School Research Program',
};

export default async function Page() {
  const blocks = await getPageBlocks('secondary-research');
  return <SecondaryResearchContent blocks={blocks} />;
}
