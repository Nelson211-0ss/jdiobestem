import Link from 'next/link';
import localFont from 'next/font/local';

import Icon from '@/components/Icon';
import MagazineLogo from '@/components/MagazineLogo';
import NewsletterForm from '@/components/NewsletterForm';
import type { SiteIssue as Issue } from '@/lib/site-content';

/**
 * Minion Pro, self-hosted, for this page alone.
 *
 * The rest of the site is Vistol — a geometric sans that suits a foundation
 * explaining itself. A magazine is a different act of reading: long passages,
 * held for minutes rather than scanned in seconds, and a text face cut for
 * that is what makes the page feel like a publication rather than a section of
 * the website with a cover picture on it.
 *
 * Four faces, not the ten in the archive. Regular and its italic carry the
 * prose, semibold the subheads, bold the mastheads; medium, the condensed cuts
 * and the bold italic were dropped because nothing here asked for them and each
 * one is another 55 KB. Declared in this file rather than the root layout so
 * Next only ships it on the routes that render this component.
 *
 * Subset to the Latin the site uses — 225 KB for four faces instead of 1.6 MB
 * of OpenType.
 */
const minion = localFont({
  src: [
    { path: '../app/fonts/MinionPro-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../app/fonts/MinionPro-It.woff2', weight: '400', style: 'italic' },
    { path: '../app/fonts/MinionPro-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../app/fonts/MinionPro-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-minion',
  display: 'swap',
  // Georgia is the closest thing most machines already have; the generic
  // serif is what stops a fallback landing on a sans and undoing the point.
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const isPublished = (i: Issue) => i.status === 'published';

/**
 * STEM Bridge Magazine.
 *
 * The page renders from the issues the CMS returns rather than naming any one
 * of them, so it keeps working as issues accumulate: the newest leads the hero,
 * the rest fall into the archive, and the copy switches between "read it" and
 * "it's coming" from each issue's own status.
 *
 * Everything stated about an issue comes from its artwork — masthead, issue
 * line, cover stories, back-cover epigraph. Nothing here invents a schedule or
 * an article list that does not exist.
 */

function IssueCover({ issue, className = '' }: { issue: Issue; className?: string }) {
  const img = (
    <img
      src={issue.cover}
      alt={issue.coverAlt}
      width={1226}
      height={1600}
      loading="lazy"
      decoding="async"
    />
  );

  // With no file there is nothing to link to, so the cover is just an image.
  if (!issue.file) return <div className={className}>{img}</div>;

  const what = isPublished(issue) ? `Download ${issue.name}` : `${issue.name} — cover`;
  return (
    <a
      href={issue.file.href}
      download={issue.file.filename}
      className={className}
      aria-label={`${what} (PDF, ${issue.file.size})`}
    >
      {img}
    </a>
  );
}

export default function MagazineContent({ issues }: { issues: Issue[] }) {
  const [featured, ...archive] = issues;
  if (!featured) {
    return (
      <main>
        <section className="section-tight">
          <div className="container-page text-center">
            <h1>STEM Bridge Magazine</h1>
            <p className="mt-4 text-lg text-charcoal-600">No issues published yet.</p>
          </div>
        </section>
      </main>
    );
  }
  const live = isPublished(featured);
  const file = featured.file;

  return (
    <>
      <main>
        {/* Masthead and the featured issue, on white. */}
        <section className="magazine-hero">
          <div className="container-page">
            {/* The issue itself, front and back, and nothing else.
                The masthead, the standfirst and the buttons all still exist
                further down the page — "Download the cover" and "Know when the
                issue lands" each have a section of their own — so nothing is
                lost by letting the artwork carry the hero alone. */}
            <h1 className="sr-only">
              STEM Bridge Magazine — {featured.name}
            </h1>

            <div className="magazine-wrap-stage">
              {/* The same artwork again, blurred and pushed down behind the
                  real one: it throws the cover's own colour onto the page
                  below it, so the spread sits on the white rather than being
                  pasted onto it. Hidden from assistive tech — it carries no
                  information the sharp copy does not. */}
              <img
                src={featured.wrap ?? featured.cover}
                alt=""
                aria-hidden="true"
                className="magazine-wrap-glow"
                loading="eager"
                decoding="async"
              />
              {/* The block of page edges under the cover. What you actually see
                  of a magazine's thickness is a band of leaves, not a stack of
                  cards — so it is one thin element with striations, sitting
                  directly beneath the artwork. */}
              <span className="magazine-wrap-pages" aria-hidden="true" />

              <img
                src={featured.wrap ?? featured.cover}
                alt={featured.wrapAlt ?? `Front and back cover of ${featured.name}`}
                className="magazine-wrap"
                width={1800}
                height={1138}
                loading="eager"
                decoding="async"
              />

              {/* The gutter. An open magazine curves into its spine; without
                  this the spread reads as one flat sheet. */}
              <span className="magazine-wrap-gutter" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Contents of the featured issue */}
        {featured.stories.length ? (
          <section className="section-tight bg-white">
            <div className="container-page">
              <div className="section-head">
                <p className="eyebrow">In this issue</p>
                <h2>What {featured.name} covers</h2>
                <p className="lede">The stories carried on the cover of {featured.name}.</p>
              </div>

              <div className="grid-cards-2">
                {featured.stories.map((story) => (
                  <article key={story.title} className="card-plain">
                    <p className="eyebrow">Cover story</p>
                    <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-charcoal-900">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-charcoal-600">{story.blurb}</p>
                  </article>
                ))}
              </div>

              {featured.epigraph ? (
                <figure className="magazine-quote">
                  <blockquote>{featured.epigraph.quote}</blockquote>
                  <figcaption>
                    {featured.epigraph.attribution} &middot; {featured.epigraph.source}
                  </figcaption>
                </figure>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Read / download */}
        {file ? (
          <section className="section-tight">
            <div className="container-page">
              <div className="panel-dark">
                <div className="split">
                  {featured.wrap ? (
                    <div className="magazine-spread">
                      <img
                        src={featured.wrap}
                        alt={featured.wrapAlt ?? ''}
                        width={1800}
                        height={1138}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}

                  <div>
                    <p className="eyebrow">Read it</p>
                    <h2 className="mt-3">
                      {live ? `Download ${featured.name}` : `Download the ${featured.label} cover`}
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-white/80">
                      {live
                        ? 'A free PDF — read it on any device, print it for a classroom, or pass it on to a student who needs to see what is possible.'
                        : 'The cover is available now as a free PDF. The issue itself is still in production — sign up below and we will send it the moment it is ready.'}
                    </p>

                    <dl className="magazine-meta">
                      <div>
                        <dt>Format</dt>
                        <dd>PDF</dd>
                      </div>
                      <div>
                        <dt>Size</dt>
                        <dd>{file.size}</dd>
                      </div>
                      <div>
                        <dt>Contains</dt>
                        <dd>{file.contains}</dd>
                      </div>
                    </dl>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <a href={file.href} download={file.filename} className="btn-primary">
                        <Icon name="download" />
                        Download PDF
                      </a>
                      <a
                        href={file.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                      >
                        <Icon name="external-link" />
                        Open in browser
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* Archive — appears on its own once there is a second issue. */}
        {archive.length ? (
          <section className="section-tight" id="archive">
            <div className="container-page">
              <div className="section-head">
                <p className="eyebrow">Archive</p>
                <h2>Past issues</h2>
                <p className="lede">Every issue stays free to read and download.</p>
              </div>

              <div className="magazine-archive">
                {archive.map((issue) => (
                  <article key={issue.id} className="magazine-back-issue">
                    <IssueCover issue={issue} className="magazine-back-cover" />
                    <p className="magazine-back-label">{issue.label}</p>
                    <h3 className="magazine-back-title">
                      {issue.stories[0]?.title ?? issue.name}
                    </h3>
                    {issue.file ? (
                      <a
                        href={issue.file.href}
                        download={issue.file.filename}
                        className="link-cta mt-3"
                      >
                        Download
                        <Icon name="download" />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Alerts + contribute */}
        <section id="alerts" className="section-tight">
          <div className="container-page">
            <div className="grid-cards-2">
              <div className="card-plain">
                <p className="eyebrow">Stay posted</p>
                <h2 className="mt-3">
                  {live ? 'Know when the next issue lands' : 'Know when the issue lands'}
                </h2>
                <p className="mt-4 text-charcoal-600">
                  {issues.length > 1
                    ? 'New issues are published as the work is ready rather than to a fixed calendar. Leave your email and we will tell you the moment the next one is out — nothing else.'
                    : 'This is the first issue and there is no fixed publication date yet. Leave your email and we will tell you the moment it is ready — nothing else.'}
                </p>
                <NewsletterForm
                  source="magazine"
                  id="magazine-alert-email"
                  tone="light"
                  label="Your email"
                  cta="Notify me"
                  doneMessage="Done — we'll email you the moment the next issue is out."
                />
              </div>

              <div className="card-plain">
                <p className="eyebrow">Contribute</p>
                <h2 className="mt-3">Write for the magazine</h2>
                <p className="mt-4 text-charcoal-600">
                  The magazine exists to publish the students in our programs &mdash; what they
                  built, what broke, and what they learned fixing it. If you are a student, mentor,
                  or teacher with a story like that, we want to read it.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary">
                    Pitch a story
                    <Icon name="arrow-right" />
                  </Link>
                  <Link href="/programs" className="btn-ghost">
                    See the programs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
