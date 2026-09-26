import type { Metadata } from 'next';
import { socialMetadata } from '@/lib/social-metadata';

import ContactContent from '@/content/contact';
import { getPageBlocks } from '@/lib/site-content';

export const metadata: Metadata = socialMetadata({
  title: 'Contact',
  path: '/contact',
  card: 'contact',
});

export default async function Page() {
  const blocks = await getPageBlocks('contact');
  return <ContactContent blocks={blocks} />;
}
