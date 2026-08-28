import Link from 'next/link';
import Icon from '@/components/Icon';
import type { SiteProgramme } from '@/lib/site-content';

/**
 * The programmes index.
 *
 * The pathway strip and the flagship cards are the same four records rendered
 * twice, so both are driven from the `programmes` table rather than repeated
 * in the markup. Everything else on this page is bespoke layout and stays
 * here — see `PageBlock` for how its copy becomes editable.
 */
export default function ProgramsContent({ programmes }: { programmes: SiteProgramme[] }) {
  const pathway = programmes.filter((p) => p.pathway_stage);
  return (
    <>
      <main>
          {/* Hero */}
          <section className="page-hero">
            <img src="/images/programs-hero.jpg" alt="" className="page-hero__bg" width="1600" height="900"/>
            <div className="page-hero__overlay" aria-hidden="true"></div>
            <div className="page-hero__inner">
              <p className="page-hero__eyebrow">Our Programs</p>
              <h1>Building the Next Generation of STEM Leaders</h1>
              <p className="page-hero__lede">From a student&apos;s first science experiment to university scholarships, research, and professional mentorship, we provide a comprehensive pathway that empowers learners at every stage of their STEM journey.</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a href="#flagship" className="btn-on-brand">Explore Programs</a>
                <Link href="/donate" className="btn-outline-on-brand">Support Our Mission</Link>
              </div>
            </div>
          </section>

          {/* STEM Development Pathway */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="git-branch" className="h-4 w-4"/>
                  {' '}Our STEM Development Pathway
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  A lifelong STEM journey
                </h2>
                <p className="sr-fade-up mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
                  Designed to inspire curiosity, develop skills, create opportunities, and prepare future innovators — from a student&apos;s first exposure to STEM all the way to university, research, and professional careers.
                </p>
              </div>

              <ol className="sr-stagger mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-10 pt-10 lg:grid-cols-4">
                {pathway.map((p) => (
                  <li key={p.slug} className="sr-fade-up relative">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name={p.icon} className="h-6 w-6"/></span>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-orange-700">{p.pathway_stage}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{p.pathway_label}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Four flagship programs */}
          <section id="flagship" className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="layers" className="h-4 w-4"/>
                  {' '}Our Flagship Programs
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  Four programs, one connected mission
                </h2>
              </div>

              <div className="sr-stagger mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {programmes.map((p) => (
                  <article key={p.slug} className="sr-fade-up group flex flex-col overflow-hidden rounded-lg bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-900/10 shadow-card">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={p.image} alt={p.image_alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" width="400" height="300" loading="lazy" decoding="async"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent"></div>
                      <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-lg ring-1 ring-white/20" aria-hidden="true"><Icon name={p.icon} className="h-5 w-5"/></span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-orange-700">{p.tagline}</p>
                      <p className="mt-3 text-sm leading-6 text-gray-600">{p.summary}</p>
                      {p.href && (
                        <Link href={p.href} className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-orange-700 hover:text-orange-800">
                          Explore <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"/>
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* What makes our programs unique */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="star" className="h-4 w-4"/>
                  {' '}What Makes Us Unique
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  A complete educational ecosystem
                </h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-x-10 gap-y-10 pt-9 sm:gap-x-12 lg:grid-cols-3">
                <div className="sr-fade-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="git-merge" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Comprehensive STEM Pipeline</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Supporting students from childhood through university.</p>
                </div>
                <div className="sr-fade-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="tool" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Hands-On Learning</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Learning by designing, building, experimenting, and solving.</p>
                </div>
                <div className="sr-fade-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="users" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Mentorship</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Connecting students with engineers, scientists, educators, and industry professionals.</p>
                </div>
                <div className="sr-fade-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="globe" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Community Impact</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Programs designed to strengthen communities through education and innovation.</p>
                </div>
                <div className="sr-fade-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="zap" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Innovation</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Encouraging creativity, entrepreneurship, and research.</p>
                </div>
                <div className="sr-fade-up">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="trending-up" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Career Readiness</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">Preparing students for higher education and STEM careers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Impact */}
          <section id="impact" className="surface-brand py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                  <Icon name="bar-chart-2" className="h-4 w-4"/>
                  {' '}Our Impact
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Growing across Uganda</h2>
              </div>
              <dl className="sr-stagger mt-10 grid grid-cols-2 gap-x-8 gap-y-12 pt-9 md:grid-cols-3 lg:grid-cols-6">
                <div className="sr-fade-up">
                  <dt className="counter text-4xl font-bold tabular-nums tracking-tight sm:text-5xl" data-target="5000" data-suffix="+">0+</dt>
                  <dd className="mt-2 text-sm text-orange-100">Students Reached</dd>
                </div>
                <div className="sr-fade-up">
                  <dt className="counter text-4xl font-bold tabular-nums tracking-tight sm:text-5xl" data-target="100" data-suffix="+">0+</dt>
                  <dd className="mt-2 text-sm text-orange-100">Schools &amp; Partners</dd>
                </div>
                <div className="sr-fade-up">
                  <dt className="counter text-4xl font-bold tabular-nums tracking-tight sm:text-5xl" data-target="250" data-suffix="+">0+</dt>
                  <dd className="mt-2 text-sm text-orange-100">STEM Activities</dd>
                </div>
                <div className="sr-fade-up">
                  <dt className="counter text-4xl font-bold tabular-nums tracking-tight sm:text-5xl" data-target="50" data-suffix="+">0+</dt>
                  <dd className="mt-2 text-sm text-orange-100">Scholarships &amp; Research</dd>
                </div>
                <div className="sr-fade-up">
                  <dt className="counter text-4xl font-bold tabular-nums tracking-tight sm:text-5xl" data-target="300" data-suffix="+">0+</dt>
                  <dd className="mt-2 text-sm text-orange-100">Volunteers</dd>
                </div>
                <div className="sr-fade-up">
                  <dt className="counter text-4xl font-bold tabular-nums tracking-tight sm:text-5xl" data-target="15" data-suffix="+">0+</dt>
                  <dd className="mt-2 text-sm text-orange-100">Districts Served</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Get involved */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="heart" className="h-4 w-4"/>
                  {' '}Get Involved
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">There&apos;s a place for you</h2>
              </div>
              <div className="sr-stagger mt-9 grid gap-10 pt-9 md:grid-cols-3 md:gap-0">
                <div className="sr-fade-up flex flex-col text-center md:px-8">
                  <span className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="edit-3" className="h-7 w-7"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Apply</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">Become part of one of our STEM programs.</p>
                  <Link href="/contact" className="mt-6 btn-primary">Apply Now</Link>
                </div>
                <div className="sr-fade-up flex flex-col text-center md:px-8">
                  <span className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="user-plus" className="h-7 w-7"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Volunteer</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">Share your expertise and inspire future innovators.</p>
                  <Link href="/volunteers" className="mt-6 btn-on-brand">Become a Volunteer</Link>
                </div>
                <div className="sr-fade-up flex flex-col text-center md:px-8">
                  <span className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="gift" className="h-7 w-7"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Support</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">Help create opportunities for the next generation.</p>
                  <Link href="/donate" className="mt-6 btn-on-brand">Donate Today</Link>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="surface-brand py-14">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="sr-fade-up text-3xl font-bold tracking-tight sm:text-4xl">Together, we are building Africa&apos;s future STEM leaders</h2>
              <p className="sr-fade-up mx-auto mt-5 max-w-2xl text-base leading-7 text-orange-100">
                Whether you are a student, educator, volunteer, donor, or partner, there is a place for you in our mission to inspire, educate, and empower the next generation of scientists, engineers, innovators, and problem solvers.
              </p>
              <div className="sr-fade-up mt-8 flex flex-wrap justify-center gap-4">
                <a href="#flagship" className="btn-on-brand">Explore Programs</a>
                <Link href="/contact" className="btn-outline-on-brand">Become a Partner</Link>
                <Link href="/donate" className="btn-outline-on-brand">Donate</Link>
              </div>
            </div>
          </section>

        </main>
    </>
  );
}
