import { notFound } from 'next/navigation';

import BlockPreview from '@/components/BlockPreview';
import { isPreviewable } from '@/lib/previewable-pages';
import { getPageBlocks } from '@/lib/site-content';

/**
 * The live preview behind the Page copy editor.
 *
 * Outside the dashboard's `.admin-shell`, so it picks up the site's own
 * stylesheets from the root layout — what is shown is the page, not an
 * approximation of it.
 *
 * The wording it starts from is fetched here, on the server. The block being
 * edited arrives by postMessage, so nothing an editor types is ever in the URL:
 * this route cannot be used to make a shareable page saying whatever somebody
 * put in a query string.
 */

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!isPreviewable(page)) notFound();

  const blocks = await getPageBlocks(page);
  return <BlockPreview page={page} blocks={blocks} />;
}
