import type { Metadata } from 'next';

import PrivacyContent from '@/content/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How the Jdiobe STEM Foundation collects, uses, shares and protects personal information submitted through jdiobestem.org, including information about students taking part in our programmes.',
};

export default function Page() {
  return <PrivacyContent />;
}
