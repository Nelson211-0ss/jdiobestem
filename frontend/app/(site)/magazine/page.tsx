import type { Metadata } from 'next';

import MagazineContent from '@/content/magazine';
import { getIssues } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'STEM Bridge Magazine',
};

export default async function Page() {
  const issues = await getIssues();
  return <MagazineContent issues={issues} />;
}
