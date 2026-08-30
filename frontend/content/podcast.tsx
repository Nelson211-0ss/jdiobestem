import Link from 'next/link';

import Icon from '@/components/Icon';
import NewsletterForm from '@/components/NewsletterForm';
import { text } from '@/lib/site-content';

/**
 * The podcast, before there is a podcast.
 *
 * It has been announced and not yet published, and the page says exactly that.
 * No episode list, no launch date, no platform badges: every one of those would
 * be an invention, and a page that promises a date it then misses is worse than
 * one that admits it does not have a date.
 *
 * What it does offer is the one useful thing at this stage — a way to be told
 * when the first episode lands — and a route back to the resources that do
 * exist, so somebody who arrives here does not simply stop.
 *
 * Every line is a CMS block with a default, so the copy can be replaced from
 * the dashboard the moment there is something to say, without a deploy.
 */
export default function PodcastContent({ blocks }: { blocks: Record<string, string> }) {
  const elsewhere = [
    {
      href: '/magazine',
      title: 'STEM Bridge Magazine',
      text: 'Free to read and download, issue by issue.',
    },
    {
      href: '/news',
      title: 'News & Updates',
      text: 'What the students built, and where the programmes went.',
    },
    {
      href: '/newsletters',
      title: 'Newsletter publications',
      text: 'Past issues, and the next one straight to your inbox.',
    },
  ];

  return (
    <main>
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="page-hero__eyebrow">Resources</p>
          <h1 className="mt-3 max-w-[16ch]">{text(blocks, 'hero.heading', 'The podcast')}</h1>
          <p className="page-hero__lede">
            {text(
              blocks,
              'hero.lede',
              'It is on its way. When the first episode is out, this is where it will be.',
            )}
          </p>
        </div>
      </header>

      <section className="section-tight bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            {/* A plain mark rather than a fabricated cover: there is no artwork
                yet, and a placeholder that looks like artwork reads as one. */}
            <span className="podcast-mark" aria-hidden="true">
              <Icon name="mic" className="h-7 w-7" />
            </span>

            <h2 className="mt-6">
              {text(blocks, 'empty.heading', 'Nothing is published yet')}
            </h2>
            <p className="mt-4 text-lg leading-8 text-charcoal-600">
              {text(
                blocks,
                'empty.body',
                'The first episode is still being made. Subscribe below and we will tell you the day it goes out — no date has been set, so we will not pretend otherwise.',
              )}
            </p>

            <div className="mt-8 flex justify-center">
              <NewsletterForm
                id="podcast-signup"
                source="podcast"
                tone="light"
                label={text(blocks, 'signup.label', 'Be told when it lands')}
                cta={text(blocks, 'signup.cta', 'Keep me posted')}
                doneMessage={text(
                  blocks,
                  'signup.done',
                  'Thank you — we will let you know when the first episode is out.',
                )}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-page">
          <div className="section-head">
            <p className="eyebrow">In the meantime</p>
            <h2>{text(blocks, 'elsewhere.heading', 'There is plenty to read')}</h2>
          </div>

          <div className="grid-cards-2 lg:grid-cols-3">
            {elsewhere.map((item) => (
              <Link key={item.href} href={item.href} className="card-plain group">
                <h3 className="text-xl">{item.title}</h3>
                <p className="mt-3 text-charcoal-600">{item.text}</p>
                <span className="link-cta mt-4 inline-flex items-center gap-2">
                  Open <Icon name="arrow-right" className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
