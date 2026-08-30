import Link from 'next/link';
import { marked } from 'marked';

import { withVideoEmbeds } from '@/lib/embeds';

import Icon from '@/components/Icon';
import type { SiteStory } from '@/lib/site-content';

marked.setOptions({ gfm: true, breaks: false });

/** A single news story, plus links on to whatever else is published. */
export default function NewsArticle({
  story,
  others,
}: {
  story: SiteStory;
  others: SiteStory[];
}) {
  // Bodies are Markdown in the database; the preview in the dashboard renders
  // through the same parser, so what an editor sees is what publishes.
  const html = withVideoEmbeds(marked.parse(story.body || '') as string);

  return (
    <>
      <main>
        <article>
          <header className="page-hero">
            <div className="page-hero__inner">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-bold text-orange-700 transition hover:text-orange-800"
              >
                <Icon name="arrow-left" className="h-4 w-4" />
                All news
              </Link>

              <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold uppercase tracking-[0.14em] text-orange-700">
                <span>{story.category}</span>
                <span aria-hidden="true" className="text-charcoal-300">
                  &middot;
                </span>
                <time dateTime={story.date} className="text-charcoal-500">
                  {story.dateLabel}
                </time>
                {story.readingTime ? (
                  <>
                    <span aria-hidden="true" className="text-charcoal-300">
                      &middot;
                    </span>
                    <span className="text-charcoal-500">{story.readingTime}</span>
                  </>
                ) : null}
              </p>

              <h1 className="mt-4 max-w-[24ch]">{story.title}</h1>
              <p className="page-hero__lede">{story.excerpt}</p>
            </div>
          </header>

          <section className="section-tight">
            <div className="container-page">
              {story.image ? (
                <figure className="news-article-figure">
                  <img
                    src={story.image}
                    alt={story.imageAlt ?? ''}
                    width={1200}
                    height={1600}
                    loading="eager"
                    decoding="async"
                  />
                  {story.caption ? <figcaption>{story.caption}</figcaption> : null}
                </figure>
              ) : null}

              <div className="news-article-body" dangerouslySetInnerHTML={{ __html: html }} />

              {story.gallery?.length ? (
                <div className="news-gallery">
                  {story.gallery.map((shot) => (
                    <figure key={shot.src}>
                      <img
                        src={shot.src}
                        alt={shot.alt}
                        width={1600}
                        height={1066}
                        loading="lazy"
                        decoding="async"
                      />
                      {shot.caption ? <figcaption>{shot.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              ) : null}

              {story.links?.length ? (
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  {story.links.map((l) => (
                    <Link key={l.href} href={l.href} className="btn-ghost">
                      {l.icon ? <Icon name={l.icon} /> : null}
                      {l.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {others.length ? (
            <section className="section-tight">
              <div className="container-page">
                <h2 className="mb-8 text-orange-700">More news</h2>
                <div className="news-grid">
                  {others.map((s) => (
                    <div key={s.slug} className="news-item">
                      {s.image ? (
                        <Link href={`/news/${s.slug}`} className="news-item-media">
                          <img
                            src={s.image}
                            alt={s.imageAlt ?? ''}
                            width={1200}
                            height={800}
                            loading="lazy"
                            decoding="async"
                          />
                        </Link>
                      ) : (
                        <Link href={`/news/${s.slug}`} className="news-item-media is-plain">
                          <span>{s.category}</span>
                        </Link>
                      )}
                      <p className="news-item-meta">
                        <time dateTime={s.date}>{s.dateLabel}</time>
                      </p>
                      <h3 className="news-item-title">
                        <Link href={`/news/${s.slug}`}>{s.title}</Link>
                      </h3>
                      <p className="news-item-excerpt">{s.excerpt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </article>
      </main>
    </>
  );
}
