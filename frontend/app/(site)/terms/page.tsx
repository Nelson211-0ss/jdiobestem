import type { Metadata } from 'next';

import TermsContent from '@/content/terms';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The terms on which the Jdiobe STEM Foundation makes jdiobestem.org available, covering permitted use, submissions, donations, intellectual property and liability.',
};

export default function Page() {
  return <TermsContent />;
}
