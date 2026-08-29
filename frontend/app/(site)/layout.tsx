import FaqAccordions from '@/components/FaqAccordions';
import Footer from '@/components/Footer';
import Header, { type MegaFeature } from '@/components/Header';
import Preloader from '@/components/Preloader';
import ScrollEffects from '@/components/ScrollEffects';
import { getIssues, getStories } from '@/lib/site-content';

/**
 * The public site's chrome.
 *
 * It lives here rather than in the root layout so the dashboard does not
 * inherit it — an admin page has no business rendering the marketing header,
 * the footer newsletter form, or the preloader overlay.
 *
 * The newest story and issue are read here and handed to the header, because
 * the header is a client component and cannot fetch. Both calls are the same
 * cached reads the pages themselves use, so this costs nothing extra.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [stories, issues] = await Promise.all([getStories(), getIssues()]);

  const features: MegaFeature[] = [];

  const story = stories[0];
  if (story) {
    features.push({
      href: `/news/${story.slug}`,
      eyebrow: 'Latest story',
      title: story.title,
      text: story.excerpt,
      image: story.image ?? '',
      cta: 'Read the story',
    });
  }

  const issue = issues[0];
  if (issue) {
    features.push({
      href: '/magazine',
      eyebrow: 'STEM Bridge Magazine',
      title: issue.name,
      // An issue in production has no article to promise, so the copy says
      // which state it is in rather than implying it can be read now.
      text:
        issue.status === 'published'
          ? 'The current issue, free to read and free to pass on.'
          : 'The next issue is in production.',
      image: issue.cover ?? '',
      cta: issue.status === 'published' ? 'Read the issue' : 'See the magazine',
    });
  }

  return (
    <>
      <Preloader />
      <Header features={features} />
      {children}
      <Footer />
      <ScrollEffects />
      <FaqAccordions />
    </>
  );
}
