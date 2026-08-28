import type { Metadata } from 'next';

import AerospaceInstituteContent from '@/content/aerospace-institute';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Aerospace Institute',
  description:
    'The Jdiobe STEM Foundation Aerospace Institute is in development — a planned home for aerospace education, research, and industry partnership. See what we are building and how to join the effort.',
};

export default async function Page() {
  const blocks = await getPageBlocks('aerospace-institute');
  return <AerospaceInstituteContent blocks={blocks} />;
}
