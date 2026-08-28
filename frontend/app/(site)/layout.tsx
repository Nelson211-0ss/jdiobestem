import FaqAccordions from '@/components/FaqAccordions';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import ScrollEffects from '@/components/ScrollEffects';

/**
 * The public site's chrome.
 *
 * It lives here rather than in the root layout so the dashboard does not
 * inherit it — an admin page has no business rendering the marketing header,
 * the footer newsletter form, or the preloader overlay.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <Header />
      {children}
      <Footer />
      <ScrollEffects />
      <FaqAccordions />
    </>
  );
}
