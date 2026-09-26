import HomeContent from '@/content/home';
import { getSiteStats } from '@/lib/site-content';
import { siteName, socialMetadata } from '@/lib/social-metadata';

export const metadata = {
  ...socialMetadata({ path: '/' }),
  title: { absolute: siteName },
};

export default async function Page() {
  const stats = await getSiteStats();
  return <HomeContent stats={stats} />;
}
