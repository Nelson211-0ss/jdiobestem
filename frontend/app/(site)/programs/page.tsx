import type { Metadata } from 'next';

import ProgramsContent from '@/content/programs';
import { getProgrammes } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Programs',
};

export default async function Page() {
  const programmes = await getProgrammes();
  return <ProgramsContent programmes={programmes} />;
}
