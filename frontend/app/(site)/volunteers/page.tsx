import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import VolunteersContent from '@/content/volunteers';
import { getPageBlocks, getRecognisedVolunteers } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Volunteers',
  path: '/volunteers',
  card: 'volunteers',
});

export default async function Page() {
  const [blocks, recognised] = await Promise.all([
    getPageBlocks('volunteers'),
    getRecognisedVolunteers(),
  ]);
  return <VolunteersContent blocks={blocks} recognised={recognised} />;
}
