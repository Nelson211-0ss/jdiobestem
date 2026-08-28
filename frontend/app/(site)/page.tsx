import HomeContent from '@/content/home';
import { getSiteStats } from '@/lib/site-content';

export default async function Page() {
  const stats = await getSiteStats();
  return <HomeContent stats={stats} />;
}
