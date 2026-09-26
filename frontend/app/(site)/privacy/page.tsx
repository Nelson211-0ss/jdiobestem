import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import PrivacyContent from '@/content/privacy';

export const metadata: Metadata = socialMetadata({
  title: 'Privacy Policy',
  path: '/privacy',
  card: 'privacy',
  description: 'How the Jdiobe STEM Foundation collects, uses, shares and protects personal information submitted through jdiobestem.org, including information about students taking part in our programmes.',
});

export default function Page() {
  return <PrivacyContent />;
}
