import type { Metadata } from 'next';

import DonateContent from '@/content/donate';

export const metadata: Metadata = {
  title: 'Donate',
};

export default function Page() {
  return <DonateContent />;
}
