import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import DonateContent from '@/content/donate';

export const metadata: Metadata = socialMetadata({
  title: 'Donate',
  path: '/donate',
  card: 'donate',
});

export default function Page() {
  return <DonateContent />;
}
