import type { Metadata } from 'next';

import ContactContent from '@/content/contact';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Contact',
};

export default async function Page() {
  const blocks = await getPageBlocks('contact');
  return <ContactContent blocks={blocks} />;
}
