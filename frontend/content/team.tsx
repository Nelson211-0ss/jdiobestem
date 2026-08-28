import Icon from '@/components/Icon';
import type { SiteTeamMember } from '@/lib/site-content';
import Link from 'next/link';
import TeamDirectory from '@/components/TeamDirectory';

export default function TeamContent({ people }: { people: SiteTeamMember[] }) {
  return (
    <>
      <main>
        {/* Hero — the one orange band on this page, so the portraits below carry
            the colour on their own arches rather than competing with it. */}
        <section className="page-hero surface-brand">
          <div className="page-hero__inner">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div>
                <p className="page-hero__eyebrow">Our People</p>
                <h1 className="mt-3 max-w-[24ch]">
                  Get to know the people behind the Jdiobe STEM Foundation
                </h1>
                <p className="page-hero__lede">
                  Educators, engineers, and organisers working across Uganda and South Sudan to put
                  STEM within reach of students who would not otherwise get near it.
                </p>
              </div>

              {/* Decorative dot cluster, echoing the mark's geometry. */}
              <div className="hidden justify-self-end lg:block" aria-hidden="true">
                <svg viewBox="0 0 200 200" className="h-44 w-44 text-charcoal-900/15">
                  {[
                    [150, 30],
                    [110, 62],
                    [158, 70],
                    [70, 100],
                    [118, 108],
                    [38, 140],
                    [82, 148],
                    [30, 178],
                  ].map(([cx, cy]) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="21" fill="currentColor" />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </section>

        <div className="pattern-band" aria-hidden="true" />

        {/* Founder feature — one person given room before the grid, the way the
            reference page leads with its chief executive. */}
        <section className="section-tight">
          <div className="container-page">
            <div className="split">
              <div className="founder-portrait">
                <img
                  src="/images/muwanika.jpg"
                  alt="Muwanika Jdiobe, PhD, Founder and Executive Director"
                  width={960}
                  height={1280}
                  loading="eager"
                  decoding="async"
                />
              </div>

              <div>
                <p className="eyebrow">Our Founder</p>
                <h2 className="mt-3">Muwanika Jdiobe, PhD</h2>
                <p className="mt-2 text-lg font-bold text-orange-700">
                  Founder &amp; Executive Director
                </p>
                <p className="mt-6 text-lg leading-8 text-charcoal-600">
                  Dr. Jdiobe&rsquo;s journey from the classrooms of Uganda to earning a Ph.D. in
                  Mechanical and Aerospace Engineering is the reason this foundation exists. He
                  built it to shorten that path for the students coming after him.
                </p>
                <p className="mt-4 text-lg leading-8 text-charcoal-600">
                  The foundation was created to help close the gap he lived: talent is everywhere,
                  but the access that turns talent into a career is not.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/about" className="btn-primary">
                    Read our story
                    <Icon name="arrow-right" />
                  </Link>
                  <Link href="/contact" className="btn-ghost">
                    Invite him to speak
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Directory — tabbed, because leadership and mentors are different asks
            and a single long grid buries the second one. */}
        <TeamDirectory
          people={people.map((p) => ({
            group: p.group,
            name: p.name,
            role: p.role,
            img: p.img ?? '',
            alt: p.alt,
            focus: p.focus ?? undefined,
            bio: p.bio ?? '',
            linkedin: p.links.find((l) => l.kind === 'linkedin')?.href ?? '',
            email: p.links.find((l) => l.kind === 'email')?.href ?? '',
          }))}
        />

        {/* Join us */}
        <section className="section-tight">
          <div className="container-page">
            <div className="panel-brand text-center">
              <p className="eyebrow">Get Involved</p>
              <h2 className="mx-auto mt-3 max-w-[20ch]">
                There is room here for what you know
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
                Mentors, tutors, event organisers, and partners shape every programme we run. If
                that sounds like you, we would like to hear from you.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/volunteers" className="btn-on-brand">
                  Volunteer with us
                </Link>
                <Link href="/contact" className="btn-ghost">
                  Partner with us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
