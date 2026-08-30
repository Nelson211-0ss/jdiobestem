'use client';

import { useEffect, useState } from 'react';


import AboutContent from '@/content/about';
import AerospaceContent from '@/content/aerospace-institute';
import CommunityOutreachContent from '@/content/community-outreach';
import ContactContent from '@/content/contact';
import ImpactContent from '@/content/impact';
import MentorshipContent from '@/content/mentorship';
import PodcastContent from '@/content/podcast';
import ScholarshipContent from '@/content/scholarship';
import SecondaryResearchContent from '@/content/secondary-research';
import SouthSudanContent from '@/content/south-sudan';
import UgandaContent from '@/content/uganda';
import YouthStemContent from '@/content/youth-stem';

/**
 * A page, as the website renders it, with one block being edited live.
 *
 * The real content component is used rather than a reimplementation of it, so
 * the preview cannot drift from the page: change the layout and the preview
 * changes with it, because they are the same file.
 *
 * The base wording comes from the server. The editor then sends the block it is
 * changing by postMessage, same origin, and it is merged on top — nothing is
 * fetched and nothing is stored, so the preview can never write to the page it
 * is previewing.
 */

const PAGES: Record<string, (p: { blocks: Record<string, string> }) => React.ReactNode> = {
  about: AboutContent,
  'aerospace-institute': AerospaceContent,
  'community-outreach': CommunityOutreachContent,
  contact: ContactContent,
  impact: ImpactContent,
  mentorship: MentorshipContent,
  podcast: PodcastContent,
  scholarship: ScholarshipContent,
  'secondary-research': SecondaryResearchContent,
  'south-sudan': SouthSudanContent,
  uganda: UgandaContent,
  'youth-stem': YouthStemContent,
};

export default function BlockPreview({
  page,
  blocks,
}: {
  page: string;
  blocks: Record<string, string>;
}) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  // The words most recently sent, so the frame can go and find them.
  const [hunting, setHunting] = useState('');

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; page?: string; key?: string; value?: string };
      if (data?.type !== 'jdiobe:block-preview') return;
      // A block belongs to one page; ignore anything meant for another.
      if (data.page && data.page !== page) return;
      if (!data.key) return;
      setOverrides((prev) => ({ ...prev, [data.key as string]: data.value ?? '' }));
      setHunting(data.value ?? '');
    };

    window.addEventListener('message', onMessage);
    // Tell the editor the frame is ready, so a draft opened before this
    // mounted is not lost.
    window.parent?.postMessage({ type: 'jdiobe:preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [page]);

  /**
   * Scroll to the text being edited.
   *
   * These pages run to a dozen sections; a preview that always shows the top
   * of the page is no use for a block halfway down it. The first few words are
   * enough to find the element, and short of that there is nothing distinctive
   * to search for — so a very short value is left alone rather than scrolling
   * somewhere arbitrary.
   */
  useEffect(() => {
    const needle = hunting.trim().slice(0, 40);
    if (needle.length < 6) return;

    const timer = setTimeout(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.textContent?.includes(needle)) {
          const el = node.parentElement;
          if (!el) continue;
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // A brief mark, so the eye lands on the right line rather than
          // somewhere in the middle of the section.
          el.style.transition = 'background-color 0.4s ease';
          el.style.backgroundColor = 'rgba(254, 92, 0, 0.16)';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 900);
          return;
        }
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [hunting]);

  const Content = PAGES[page];
  if (!Content) {
    return (
      <main className="preview-static section-tight">
        <div className="container-page text-center">
          <h1>No preview for this page</h1>
          <p className="mt-4 text-lg text-charcoal-600">
            The <code>{page}</code> page is not one of the hand-built pages this preview covers.
          </p>
        </div>
      </main>
    );
  }

  // `preview-static` turns off the scroll reveals: this page renders outside
  // the site layout, so nothing would ever switch them on.
  return (
    <div className="preview-static">
      <Content blocks={{ ...blocks, ...overrides }} />
    </div>
  );
}
