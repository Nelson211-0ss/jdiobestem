import { revalidateTag } from 'next/cache';

/**
 * Resources whose records are rendered on the public website.
 *
 * Writing to one of these has to drop the site's content cache, otherwise a
 * story published in the dashboard sits invisible for up to a minute and the
 * person who published it reasonably concludes it did not work.
 */
const PUBLIC_RESOURCES = new Set([
  'news',
  'team',
  'magazine',
  'stats',
  'programmes',
  'page-blocks',
]);

/** Drop the public site's cached content after a write, if this resource shows there. */
export function revalidatePublicContent(resource: string) {
  if (PUBLIC_RESOURCES.has(resource)) revalidateTag('site-content');
}
