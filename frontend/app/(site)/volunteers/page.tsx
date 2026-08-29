import type { Metadata } from 'next';

import VolunteersContent from '@/content/volunteers';
import { getPageBlocks, getRecognisedVolunteers } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Volunteers',
};

export default async function Page() {
  const [blocks, recognised] = await Promise.all([
    getPageBlocks('volunteers'),
    getRecognisedVolunteers(),
  ]);
  return <VolunteersContent blocks={blocks} recognised={recognised} />;
}
