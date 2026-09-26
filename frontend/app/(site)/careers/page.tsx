import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import CareersContent from '@/content/careers';
import { getOpenJobs, getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Careers',
  path: '/careers',
  card: 'careers',
  description: 'Work with the Jdiobe STEM Foundation.',
});

export default async function Page() {
  const [blocks, jobs] = await Promise.all([getPageBlocks('careers'), getOpenJobs()]);
  return <CareersContent blocks={blocks} jobs={jobs} />;
}
