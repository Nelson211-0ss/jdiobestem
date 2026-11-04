import type { Metadata } from 'next';

import DonateSuccessContent from '@/content/donate-success';

export const metadata: Metadata = {
  title: { absolute: 'Thank You - Jdiobe STEM Foundation' },
  // Reached by giving, not by searching. A result that lands somebody on
  // "thank you for your gift" when they have not given is a small dishonesty.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DonateSuccessContent />;
}
