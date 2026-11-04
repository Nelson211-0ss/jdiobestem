import type { MetadataRoute } from 'next';

import { getStories } from '@/lib/site-content';
import { metadataBase } from '@/lib/social-metadata';

/**
 * Every public page, and every published story.
 *
 * Without this a search engine only finds a story by following a link to it,
 * so a piece published today might not appear in results for weeks. Stories
 * come from the same cached read the news page uses, so a new one is listed
 * as soon as it is published, with no deploy.
 *
 * The donation thank-you page is left out on purpose: it is a page you reach
 * by giving, and a search result that lands somebody on "thank you for your
 * gift" when they have not given is a small dishonesty.
 */

const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/donate', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/impact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/scholarship', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/secondary-research', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/youth-stem', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/community-outreach', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/mentorship', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/aerospace-institute', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/news', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/magazine', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/newsletters', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/podcast', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/team', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/volunteers', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/uganda', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/south-sudan', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

const at = (path: string) => new URL(path, metadataBase).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getStories();
  return [
    ...PAGES.map(({ path, priority, changeFrequency }) => ({
      url: at(path),
      changeFrequency,
      priority,
    })),
    ...stories
      .filter((s) => s.slug)
      .map((s) => ({
        url: at(`/news/${s.slug}`),
        // A story's own date, so a search engine knows what is new.
        lastModified: s.date ? new Date(s.date) : undefined,
        changeFrequency: 'yearly' as const,
        priority: 0.6,
      })),
  ];
}
