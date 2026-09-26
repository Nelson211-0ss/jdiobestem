import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import CommunityOutreachContent from '@/content/community-outreach';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Community STEM Outreach',
  path: '/community-outreach',
  card: 'community-outreach',
});

export default async function Page() {
  const blocks = await getPageBlocks('community-outreach');
  return <CommunityOutreachContent blocks={blocks} />;
}
