import Link from 'next/link';
import Icon from '@/components/Icon';
import JobApplicationForm from '@/components/JobApplicationForm';
import { text, type SiteJob } from '@/lib/site-content';

/**
 * Careers.
 *
 * Every posting comes from the database, so a vacancy opens and closes without
 * a deploy. The page has two honest states: positions to show, and none — and
 * the second is not a failure, it is most of the year. Rather than an empty
 * list under a hopeful heading, it says so and points at the volunteer form,
 * which is the other way in and is always open.
 */
export default function CareersContent({
  blocks,
  jobs,
}: {
  blocks: Record<string, string>;
  jobs: SiteJob[];
}) {
  return (
    <main>
      <header className="page-hero surface-brand">
        <div className="page-hero__inner text-center">
          <p className="page-hero__eyebrow">Careers</p>
          <h1 className="mx-auto mt-3 max-w-[20ch]">
            {text(blocks, 'hero.heading', 'Work with us')}
          </h1>
          <p className="page-hero__lede mx-auto">
            {text(
              blocks,
              'hero.lede',
              'We are a small team doing work that reaches a long way. When there is a post to fill, it is listed here.',
            )}
          </p>
        </div>
      </header>

      <div className="pattern-band" aria-hidden="true" />

      <section className="section-tight bg-white">
        <div className="container-page">
          {jobs.length === 0 ? (
            <div className="mx-auto max-w-2xl text-center">
              <h2>{text(blocks, 'empty.heading', 'No open positions right now')}</h2>
              <p className="mt-4 text-lg leading-8 text-charcoal-600">
                {text(
                  blocks,
                  'empty.body',
                  'There is nothing to apply for at the moment. Posts appear here as they open — and volunteering is open all year, whether or not we are hiring.',
                )}
              </p>
              <Link href="/volunteers#apply" className="btn-primary mt-8">
                <Icon name="user-plus" />
                Volunteer instead
              </Link>
            </div>
          ) : (
            <>
              <div className="section-head">
                <h2>
                  {jobs.length} open position{jobs.length === 1 ? '' : 's'}
                </h2>
              </div>

              <div className="space-y-8">
                {jobs.map((job) => (
                  <article key={job.slug} id={job.slug} className="card">
                    <div className="card-body">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="text-2xl">{job.title}</h3>
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-orange-700">
                          {job.employment_type}
                        </p>
                      </div>

                      {job.office ? (
                        <p className="mt-1 flex items-center gap-2 text-charcoal-500">
                          <Icon name="map-pin" className="h-4 w-4" />
                          {job.office}
                        </p>
                      ) : null}

                      <p className="mt-4 text-lg leading-8 text-charcoal-600">{job.summary}</p>

                      {job.description ? (
                        <p className="mt-4 whitespace-pre-wrap text-charcoal-600">
                          {job.description}
                        </p>
                      ) : null}

                      {job.responsibilities.length > 0 ? (
                        <div className="mt-6">
                          <h4 className="text-base font-bold">What the role involves</h4>
                          <ul className="mt-3 space-y-2">
                            {job.responsibilities.map((line) => (
                              <li key={line} className="flex items-start gap-3">
                                <Icon
                                  name="check-circle"
                                  className="mt-1 h-4 w-4 shrink-0 text-orange-700"
                                />
                                <span className="text-charcoal-700">{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {job.requirements.length > 0 ? (
                        <div className="mt-6">
                          <h4 className="text-base font-bold">What we are looking for</h4>
                          <ul className="mt-3 space-y-2">
                            {job.requirements.map((line) => (
                              <li key={line} className="flex items-start gap-3">
                                <Icon
                                  name="check-circle"
                                  className="mt-1 h-4 w-4 shrink-0 text-orange-700"
                                />
                                <span className="text-charcoal-700">{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mx-auto mt-14 max-w-3xl">
                <div className="section-head">
                  <h2>Apply</h2>
                  <p className="mt-4 text-lg leading-8 text-charcoal-600">
                    Tell us who you are and which post you are applying for. Fields marked * are
                    required.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-6 shadow-card sm:p-9">
                  <JobApplicationForm jobs={jobs} />
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
