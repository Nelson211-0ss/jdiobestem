import type { Metadata } from 'next';

import CommunityOutreachContent from '@/content/community-outreach';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Community STEM Outreach',
};

export default async function Page() {
  const blocks = await getPageBlocks('community-outreach');
  return <CommunityOutreachContent blocks={blocks} />;
}
