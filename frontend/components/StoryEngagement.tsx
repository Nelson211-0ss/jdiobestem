'use client';

import { useEffect, useRef } from 'react';

/**
 * Counts a story being opened, and being finished.
 *
 * Once each per story per browser session, so a reader who refreshes or comes
 * back to finish is one reader, not three. Nothing is stored about them: the
 * marker is a key in their own sessionStorage, and the server keeps only a
 * daily tally.
 *
 * "Finished" is the end of the article scrolling into view, which is the
 * closest honest proxy for having read it — a page can be open for an hour in
 * a background tab without anybody reading a word.
 */
export default function StoryEngagement({ slug }: { slug: string }) {
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    const send = (read: boolean) => {
      const marker = `story:${read ? 'read' : 'open'}:${slug}`;
      try {
        if (sessionStorage.getItem(marker)) return;
        sessionStorage.setItem(marker, '1');
      } catch {
        // A browser refusing storage still gets counted, just not deduped.
      }
      void fetch(`/api/news/${encodeURIComponent(slug)}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
        keepalive: true,
      }).catch(() => {});
    };

    send(false);

    const sentinel = end.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    const watcher = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          send(true);
          watcher.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    watcher.observe(sentinel);
    return () => watcher.disconnect();
  }, [slug]);

  return <div ref={end} aria-hidden="true" className="h-px w-full" />;
}
