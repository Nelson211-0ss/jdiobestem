import HomeContent from '@/content/home';
import { getSiteStats, getStories } from '@/lib/site-content';
import { siteName, socialMetadata } from '@/lib/social-metadata';

export const metadata = {
  ...socialMetadata({ path: '/' }),
  title: { absolute: siteName },
};

export default async function Page() {
  const [stats, stories] = await Promise.all([getSiteStats(), getStories()]);
  const featuredStory = stories.find(story => story.slug === 'nambiro-scholarship');
  return <HomeContent stats={stats} featuredStory={featuredStory} />;
}
