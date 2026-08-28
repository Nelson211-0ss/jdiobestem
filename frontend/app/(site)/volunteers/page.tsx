import type { Metadata } from 'next';

import VolunteersContent from '@/content/volunteers';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Volunteers',
};

export default async function Page() {
  const blocks = await getPageBlocks('volunteers');
  return <VolunteersContent blocks={blocks} />;
}
