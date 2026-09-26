import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import TeamContent from '@/content/team';
import { getTeam } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Our Team',
  path: '/team',
  card: 'team',
});

export default async function Page() {
  const people = await getTeam();
  return <TeamContent people={people} />;
}
