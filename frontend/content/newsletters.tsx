import Icon from '@/components/Icon';
import NewsletterForm from '@/components/NewsletterForm';
import { text } from '@/lib/blocks';
import { type SiteIssuePdf } from '@/lib/site-content';

/**
 * Past issues of the newsletter, as a shelf of covers.
 *
 * Each issue is a PDF, so the cover carries the weight — either the artwork
 * uploaded with it or the first page rendered when it was attached. An issue
 * with neither still lists, with its title doing the work; a row that cannot
 * be opened is never shown, because the whole point of the page is reading
 * them.
 */
export default function NewslettersContent({
  blocks,
  issues,
}: {
  blocks: Record<string, string>;
  issues: SiteIssuePdf[];
}) {
  return (
    <main>
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="page-hero__eyebrow">Resources</p>
          <h1 className="mt-3 max-w-[16ch]">
            {text(blocks, 'hero.heading', 'The newsletter')}
          </h1>
          <p className="page-hero__lede">
            {text(
              blocks,
              'hero.lede',
              'What the students built, where the programmes went, and who made it possible — issue by issue.',
            )}
          </p>
        </div>
      </header>

      <section className="section-tight bg-white">
        <div className="container-page">
          {issues.length === 0 ? (
            <div className="mx-auto max-w-2xl text-center">
              <h2>{text(blocks, 'empty.heading', 'The first issue is on its way')}</h2>
              <p className="mt-4 text-lg leading-8 text-charcoal-600">
                {text(
                  blocks,
                  'empty.body',
                  'Nothing is published here yet. Subscribe below and the next issue will reach you directly.',
                )}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {issues.map((issue) => (
                <article key={issue.id} className="card">
                  <a href={issue.pdf} target="_blank" rel="noopener" className="block">
                    {issue.cover ? (
                      <div className="card-media">
                        <img
                          src={issue.cover}
                          alt={`Cover of ${issue.issue_label || issue.subject}`}
                          className="w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : null}
                  </a>
                  <div className="card-body">
                    {issue.issue_label ? (
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-700">
                        {issue.issue_label}
                      </p>
                    ) : null}
                    <h2 className="mt-1 text-xl">{issue.subject}</h2>
                    {issue.summary ? (
                      <p className="mt-2 text-charcoal-600">{issue.summary}</p>
                    ) : null}
                    <a
                      href={issue.pdf}
                      target="_blank"
                      rel="noopener"
                      className="btn-ghost mt-auto self-start pt-6"
                    >
                      <Icon name="download" />
                      Read this issue
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-cream-100 p-6 text-center sm:p-9">
            <h2 className="text-2xl">Get the next one</h2>
            <p className="mt-3 text-charcoal-600">
              One email, when there is something worth sending.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
