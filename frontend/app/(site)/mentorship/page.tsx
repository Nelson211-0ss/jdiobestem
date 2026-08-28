import type { Metadata } from 'next';

import MentorshipContent from '@/content/mentorship';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Mentorship',
  description:
    'Mentorship pairs students in Uganda and South Sudan with educators, engineers, and graduates working in the fields they are aiming for.',
};

export default async function Page() {
  const blocks = await getPageBlocks('mentorship');
  return <MentorshipContent blocks={blocks} />;
}
