import type { Metadata } from 'next';

import TeamContent from '@/content/team';
import { getTeam } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Our Team',
};

export default async function Page() {
  const people = await getTeam();
  return <TeamContent people={people} />;
}
