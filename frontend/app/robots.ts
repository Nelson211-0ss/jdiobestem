import type { MetadataRoute } from 'next';

import { metadataBase } from '@/lib/social-metadata';

/**
 * What search engines may crawl.
 *
 * The dashboard and the API are kept out: neither is anything a visitor
 * searches for, and the dashboard's pages already say `noindex` — this stops
 * crawlers spending their time knocking on a login screen in the first place.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/donate-success'] }],
    sitemap: new URL('/sitemap.xml', metadataBase).toString(),
  };
}
