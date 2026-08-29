import type { Metadata } from 'next';

import CareersContent from '@/content/careers';
import { getOpenJobs, getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Work with the Jdiobe STEM Foundation.',
};

export default async function Page() {
  const [blocks, jobs] = await Promise.all([getPageBlocks('careers'), getOpenJobs()]);
  return <CareersContent blocks={blocks} jobs={jobs} />;
}
