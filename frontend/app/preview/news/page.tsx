'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

import { withVideoEmbeds } from '@/lib/embeds';

/**
 * Live preview of a news story, as the website renders it.
 *
 * This route sits outside the dashboard's `.admin-shell`, so it picks up the
 * site's own typography and brand stylesheets from the root layout — the
 * preview is the real thing rather than a reimplementation of it that would
 * drift the first time the article page changed.
 *
 * The editor sends drafts by postMessage from the same origin; nothing is
 * fetched and nothing is stored.
 */

type Draft = {
  title: string;
  category: string;
  dateLabel: string;
  readingTime: string;
  excerpt: string;
  body: string;
  image: string;
  imageAlt: string;
  caption: string;
};

const EMPTY: Draft = {
  title: '',
  category: '',
  dateLabel: '',
  readingTime: '',
  excerpt: '',
  body: '',
  image: '',
  imageAlt: '',
  caption: '',
};

marked.setOptions({ breaks: false, gfm: true });

export default function NewsPreviewPage() {
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Same-origin only: the editor and this frame are served together.
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; draft?: Partial<Draft> };
      if (data?.type !== 'jdiobe:news-preview' || !data.draft) return;
      setDraft({ ...EMPTY, ...data.draft });
    };

    window.addEventListener('message', onMessage);

    // Announce readiness more than once: the parent may not have attached its
    // listener when this frame first mounts, and a single missed handshake
    // would leave the preview showing placeholder text forever.
    const announce = () =>
      window.parent?.postMessage({ type: 'jdiobe:preview-ready' }, window.location.origin);
    announce();
    const retries = [80, 250, 600, 1200].map((ms) => setTimeout(announce, ms));

    return () => {
      window.removeEventListener('message', onMessage);
      retries.forEach(clearTimeout);
    };
  }, []);

  const html = draft.body ? withVideoEmbeds(marked.parse(draft.body) as string) : '';

  return (
    <main>
      <article>
        <header className="page-hero">
          <div className="page-hero__inner">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-orange-700">
              All news
            </span>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
              <span>{draft.category || 'Category'}</span>
              <span aria-hidden="true" className="text-charcoal-300">
                &middot;
              </span>
              <span className="text-charcoal-500">{draft.dateLabel || 'Date'}</span>
              {draft.readingTime ? (
                <>
                  <span aria-hidden="true" className="text-charcoal-300">
                    &middot;
                  </span>
                  <span className="text-charcoal-500">{draft.readingTime}</span>
                </>
              ) : null}
            </p>

            <h1 className="mt-4 max-w-[24ch]">{draft.title || 'Your headline goes here'}</h1>
            <p className="page-hero__lede">
              {draft.excerpt || 'The one-sentence standfirst appears here, under the headline.'}
            </p>
          </div>
        </header>

        <section className="section-tight">
          <div className="container-page">
            {draft.image ? (
              <figure className="news-article-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.image} alt={draft.imageAlt || ''} width={1200} height={1600} />
                {draft.caption ? <figcaption>{draft.caption}</figcaption> : null}
              </figure>
            ) : null}

            {html ? (
              <div className="news-article-body" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div className="news-article-body">
                <p className="text-charcoal-400">
                  Start writing and the article appears here, styled exactly as the website will
                  render it.
                </p>
              </div>
            )}
          </div>
        </section>
      </article>
    </main>
  );
}
