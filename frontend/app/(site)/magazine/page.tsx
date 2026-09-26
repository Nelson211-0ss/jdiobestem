import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import MagazineContent from '@/content/magazine';
import { getIssues } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'STEM Bridge Magazine',
  path: '/magazine',
  card: 'magazine',
});

export default async function Page() {
  const issues = await getIssues();
  return <MagazineContent issues={issues} />;
}
