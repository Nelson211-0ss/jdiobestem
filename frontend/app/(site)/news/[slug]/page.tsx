import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import NewsArticle from '@/content/news-article';
import { getStories, getStory } from '@/lib/site-content';

/**
 * Stories come from the CMS now, so the set of slugs is not known at build
 * time — a story published in the dashboard has to appear without a deploy.
 * The fetch is revalidated, so this is cached rather than rendered per request.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const stories = await getStories();
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return { title: 'News' };
  return { title: story.title, description: story.excerpt };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stories = await getStories();
  const story = stories.find((s) => s.slug === slug);
  if (!story) notFound();

  return <NewsArticle story={story} others={stories.filter((s) => s.slug !== slug)} />;
}
