import Link from 'next/link';
import Icon from '@/components/Icon';
import type { SiteStory } from '@/lib/site-content';

/**
 * News index.
 *
 * The newest story runs full-bleed as a feature; the rest sit in a card grid
 * below it. Cards are image-plus-text straight on the cream page rather than in
 * a white box — with photography this varied, a container round every one adds
 * clutter without adding structure.
 */
export default function NewsContent({ stories }: { stories: SiteStory[] }) {
  const [featured, ...rest] = stories;

  // Nothing published yet is a real state, not an error — say so rather than
  // rendering a feature block with no story in it.
  if (!featured) {
    return (
      <main>
        <section className="section-tight">
          <div className="container-page text-center">
            <h1>News</h1>
            <p className="mt-4 text-lg text-charcoal-600">No stories published yet.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main>
        {/* Featured story */}
        <section
          className={`news-feature on-dark-surface${featured.image ? '' : ' is-plain'}`}
        >
          {featured.image ? (
            <>
              <img
                src={featured.image}
                alt=""
                aria-hidden="true"
                className="news-feature-bg"
                width={1600}
                height={1000}
                loading="eager"
                decoding="async"
              />
              <div className="news-feature-scrim" aria-hidden="true" />
            </>
          ) : null}

          <div className="container-page relative z-10">
            <div className="max-w-2xl">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold uppercase tracking-[0.14em] text-orange-400">
                <span>{featured.category}</span>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={featured.date} className="text-white/75">
                  {featured.dateLabel}
                </time>
              </p>
              <h1 className="mt-4 text-white">{featured.title}</h1>
              <p className="mt-5 text-lg leading-8 text-white/85">{featured.excerpt}</p>
              <Link href={`/news/${featured.slug}`} className="btn-primary mt-8">
                Read now
                <Icon name="arrow-right" />
              </Link>
            </div>
          </div>
        </section>

        {/* Index */}
        <section className="section-tight bg-white">
          <div className="container-page">
            <div className="section-head">
              <h2 className="text-orange-700">Latest news</h2>
              <p className="lede">
                Stories, milestones, and announcements from the Jdiobe STEM Foundation.
              </p>
            </div>

            {rest.length ? (
              <div className="news-grid">
                {rest.map((story) => (
                  <article key={story.slug} className="news-item">
                    {story.image ? (
                      <Link href={`/news/${story.slug}`} className="news-item-media">
                        <img
                          src={story.image}
                          alt={story.imageAlt ?? ''}
                          width={1200}
                          height={800}
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>
                    ) : (
                      // No photograph for this story — a category plate keeps the
                      // grid even instead of leaving a hole where an image would be.
                      <Link href={`/news/${story.slug}`} className="news-item-media is-plain">
                        <span>{story.category}</span>
                      </Link>
                    )}
                    <p className="news-item-meta">
                      <time dateTime={story.date}>{story.dateLabel}</time>
                    </p>
                    <h3 className="news-item-title">
                      <Link href={`/news/${story.slug}`}>{story.title}</Link>
                    </h3>
                    <p className="news-item-excerpt">{story.excerpt}</p>
                  </article>
                ))}
              </div>
            ) : null}

            <p className="mt-14 text-center text-sm text-charcoal-500">
              More stories and updates will be published here as our programs grow.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
