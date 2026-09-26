import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import SecondaryResearchContent from '@/content/secondary-research';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Secondary School Research Program',
  path: '/secondary-research',
  card: 'secondary-research',
});

export default async function Page() {
  const blocks = await getPageBlocks('secondary-research');
  return <SecondaryResearchContent blocks={blocks} />;
}
