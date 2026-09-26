import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import TermsContent from '@/content/terms';

export const metadata: Metadata = socialMetadata({
  title: 'Terms of Use',
  path: '/terms',
  card: 'terms',
  description: 'The terms on which the Jdiobe STEM Foundation makes jdiobestem.org available, covering permitted use, submissions, donations, intellectual property and liability.',
});

export default function Page() {
  return <TermsContent />;
}
