import type { Metadata } from 'next';

import DonateSuccessContent from '@/content/donate-success';

export const metadata: Metadata = {
  title: { absolute: 'Thank You — Jdiobe STEM Foundation' },
};

export default function Page() {
  return <DonateSuccessContent />;
}
