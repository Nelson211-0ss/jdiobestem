import Link from 'next/link';
import type { SiteStat } from '@/lib/site-content';
import HeroSection from '@/components/HeroSection';
import HomeIcon from '@/components/HomeIcon';
import PartnerMarquee from '@/components/PartnerMarquee';
import Testimonials from '@/components/Testimonials';
import Icon from '@/components/Icon';

export default function HomeContent({ stats }: { stats: SiteStat[] }) {
  return (
    <>
      <HeroSection />

          <main>
            {/* At-a-glance figures. Sits directly under the hero as early proof; the
                 #impact section below keeps the narrative and photography. Pulled up
                 with a negative margin so it straddles the hero's lower edge. */}
            <section className="relative z-20 -mt-14 px-6 lg:px-8" aria-label="Foundation at a glance">
              <div className="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-card sm:p-8">
                <dl className="grid grid-cols-2 gap-x-8 gap-y-8 sm:gap-x-10 lg:grid-cols-4 lg:gap-y-0">
                  {stats.map((stat, i) => (
                    <div
                      key={stat.label}
                      className={
                        i === 0
                          ? 'lg:px-8 lg:first:pl-0'
                          : i === stats.length - 1
                            ? 'lg:px-8 lg:last:pr-0'
                            : 'lg:px-8'
                      }
                    >
                      <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                        <span
                          className="counter"
                          data-target={stat.value}
                          data-suffix={stat.suffix || undefined}
                        >
                          0
                        </span>
                      </dt>
                      <dd className="mt-2 text-sm leading-6 text-stone-600">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section id="about" className="relative overflow-hidden bg-white pb-14 pt-24 md:pb-18 md:pt-28">
              <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-orange-200/25 blur-3xl" aria-hidden="true"></div>
              <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-rose-200/20 blur-3xl" aria-hidden="true"></div>

              <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col gap-6 text-center md:text-left lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                      Why it matters
                    </p>
                    <h2 className="sr-fade-up mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                      Talent is everywhere.<span className="text-orange-700"> Opportunity is not.</span>
                    </h2>
                  </div>
                  <p className="sr-fade-up max-w-xl text-lg leading-relaxed text-slate-600 lg:pb-1 lg:text-right">
                    Across Uganda, young people with STEM potential still lack labs, mentors, tuition, and networks. We build
                    the bridges so they can learn, build, and lead.
                  </p>
                </div>

                <div className="sr-stagger mt-14 grid gap-x-12 gap-y-14 pt-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
                  <div className="feature-item">
                    <HomeIcon name="access" className="feature-icon" />
                    <h3 className="feature-title">Access</h3>
                    <p className="feature-text">Scholarships, kits, and learning spaces for those who need them most.</p>
                  </div>

                  <div className="feature-item">
                    <HomeIcon name="mentorship" className="feature-icon" />
                    <h3 className="feature-title">Mentorship</h3>
                    <p className="feature-text">Educators and professionals walking alongside each cohort.</p>
                  </div>

                  <div className="feature-item">
                    <HomeIcon name="build" className="feature-icon" />
                    <h3 className="feature-title">Build</h3>
                    <p className="feature-text">Hands-on projects from robotics to research and community builds.</p>
                  </div>

                </div>

                <div className="sr-fade-up mt-10 grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
                  <div className="lg:col-span-7">
                    <div className="relative overflow-hidden rounded-lg bg-slate-900">
                      <img src="/images/catapilar.jpeg" alt="Students presenting electronics and solar experiments at a STEM exhibition" className="aspect-[4/3] w-full object-cover opacity-95 sm:aspect-auto sm:h-[min(28rem,50vh)] lg:h-full lg:min-h-[22rem]" width="1400" height="1050" loading="lazy" decoding="async"/>
                      <div className="absolute inset-0 bg-gray-900/45"></div>
                      <p className="absolute bottom-5 left-5 right-5 text-lg font-semibold leading-snug text-white drop-shadow md:text-xl">
                        Real projects. Real skills. Real momentum for the next generation.
                      </p>
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex h-full flex-col rounded-lg surface-brand p-8">
                      <p className="text-sm font-semibold uppercase tracking-wider text-white/85">Jdiobe STEM Foundation</p>
                      <p className="mt-4 text-lg leading-relaxed text-white/95">
                        We exist to turn potential into progress—through programs that meet students where they are and carry
                        them toward audacious goals in science and engineering.
                      </p>
                      <dl className="mt-8 space-y-5 pt-6">
                        
                        <div>
                          <dt className="font-semibold text-white">STEM for all</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-white/85">Inclusive outreach, scholarships, and research pathways for underserved youth.</dd>
                        </div>
                      </dl>
                      <Link href="/secondary-research" className="mt-8 w-fit btn-on-brand">
                        The Science Fair <Icon name="arrow-right" className="h-4 w-4"/>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="programs" className="bg-white py-12 md:py-14">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
                <header className="sr-fade-up lg:col-span-7 lg:pt-2 text-center md:text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">What We Do</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                    Programs designed to remove barriers and create opportunity
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-stone-600">
                    Scholarships, hands-on learning, mentorship, and research pathways for students in Uganda and beyond.
                  </p>
                </header>

                <div className="sr-fade-up mt-10 grid grid-cols-2 gap-4 sm:mx-auto sm:max-w-md lg:col-span-5 lg:col-start-8 lg:mx-0 lg:mt-0 lg:max-w-none lg:items-start" aria-label="Program highlights in photos">
                  <figure className="flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-card">
                      <img src="/images/hero-science-fair-projects.png" alt="Students presenting STEM projects at an exhibition, including electronics and solar experiments" className="h-full w-full object-cover object-center" width="1920" height="1080" loading="lazy" decoding="async"/>
                    </div>
                    <figcaption className="mt-2 flex flex-1 flex-col">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Fairs &amp; showcases</p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">
                        Research, circuits, and sustainable design on display.
                      </p>
                    </figcaption>
                  </figure>
                  <figure className="flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-card">
                      <img src="/images/hero-diy-stem-car.png" alt="Homemade motorized vehicle built from recycled materials on a workshop table" className="h-full w-full object-cover object-center" width="1920" height="1080" loading="lazy" decoding="async"/>
                    </div>
                    <figcaption className="mt-2 flex flex-1 flex-col">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Hands-on builds</p>
                      <p className="mt-1 text-xs leading-relaxed text-stone-600">
                        Engineering and creativity from everyday materials.
                      </p>
                    </figcaption>
                  </figure>
                </div>
                </div>

                <div className="sr-stagger grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16">
                  <div className="feature-item">
                    <HomeIcon name="scholarships" className="feature-icon" />
                    <h3 className="feature-title">Scholarships</h3>
                    <p className="feature-text">Financial support for tuition, materials, and travel so cost never blocks a STEM future.</p>
                  </div>

                  <div className="feature-item">
                    <HomeIcon name="stem-education" className="feature-icon" />
                    <h3 className="feature-title">STEM education</h3>
                    <p className="feature-text">Practical workshops and training that connect classroom learning to real-world skills.</p>
                  </div>

                  <div className="feature-item">
                    <HomeIcon name="mentorship" className="feature-icon" />
                    <h3 className="feature-title">Mentorship</h3>
                    <p className="feature-text">Guidance from educators and professionals to shape academic and career pathways.</p>
                  </div>

                </div>

                <div className="sr-fade-up mt-10 text-center">
                  <Link href="/secondary-research" className="btn-primary">
                    See the Science Fair{' '}
                    <Icon name="arrow-right" className="h-4 w-4"/>
                  </Link>
                </div>
              </div>
            </section>

            <section id="ongoing-projects" className="bg-white py-14">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-3xl text-center md:text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Ongoing Projects</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Student-led innovation with real-world impact
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600">
                    These active initiatives turn creativity and STEM skills into practical tools that support learning, mobility, and community access.
                  </p>
                </div>

                <div className="mt-9 grid gap-8 lg:grid-cols-3">
                  <article className="group overflow-hidden rounded-lg bg-white transition shadow-card">
                    <img src="/images/translator.png" alt="Screens from the Linguist language translator mobile app, showing voice translation and login screens" className="h-56 w-full bg-black object-contain" loading="lazy" decoding="async" width="1536" height="1024"/>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-900">Language Translator Mobile App</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        A mobile solution designed to bridge language gaps and make communication easier for communities using local and international languages.
                      </p>
                    </div>
                  </article>

                  <article className="group overflow-hidden rounded-lg bg-white transition shadow-card">
                    <img src="/images/smart%20walking%20stick.jpg" alt="The foundation's smart walking stick prototype with an integrated LED light and vibration alert module" className="h-56 w-full object-cover object-top" loading="lazy" decoding="async" width="957" height="1000"/>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-900">Smart Walking Stick</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        An assistive technology project focused on improving safety, independence, and confidence for people with mobility challenges.
                      </p>
                    </div>
                  </article>

                  <article className="group overflow-hidden rounded-lg bg-white transition shadow-card">
                    <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80" alt="A student robotics project with a mechanical robot on a worktable" className="h-56 w-full object-cover" loading="lazy" decoding="async" width="900" height="600"/>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-900">Robotics</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Hands-on robotics builds that teach problem solving, automation, and engineering through creative, team-based design.
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            <section id="impact" className="surface-brand py-14">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-3xl text-center md:text-left">
                  <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">Our Impact</p>
                  <h2 className="sr-fade-up mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Building measurable, lasting change
                  </h2>
                  <p className="sr-fade-up mt-4 text-lg leading-8 text-gray-300">
                    Outcomes from scholarships, mentorship, and partnerships across our STEM programs.
                  </p>
                </div>
                <div className="sr-fade-up mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3" aria-label="STEM program photography">
                  <div className="overflow-hidden rounded-lg ring-1 ring-white/25 sm:col-span-1">
                    <img src="/images/185A1601-scaled.jpg" alt="Student community group portrait" className="h-44 w-full object-cover object-top sm:h-52" width="800" height="520" loading="lazy" decoding="async"/>
                  </div>
                  <div className="overflow-hidden rounded-lg ring-1 ring-white/25">
                    <img src="/images/inspect.jpeg" alt="Students at a STEM project exhibition" className="h-44 w-full object-cover sm:h-52" width="800" height="520" loading="lazy" decoding="async"/>
                  </div>
                  <div className="overflow-hidden rounded-lg ring-1 ring-white/25">
                    <img src="/images/IMG_8893.jpg" alt="Student-built motorized model vehicle" className="h-44 w-full object-cover sm:h-52" width="800" height="520" loading="lazy" decoding="async"/>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white py-14">
              <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:px-8">
                <div className="sr-fade-up h-[440px] overflow-hidden rounded-lg bg-white">
                  <img src="/images/moses-nambiro.png" alt="Moses Nambiro scholarship story" className="h-full w-full object-contain object-center"/>
                </div>
                <div className="sr-fade-up text-center md:text-left">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                    <Icon name="book-open" className="h-4 w-4"/>
                    {' '}Featured Story
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Travel Scholarship Awarded to Future Aeronautical Engineer
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    On April 6, 2026, Jdiobe STEM Foundation awarded a $1,000 travel scholarship to
                    Moses Nambiro, a student from Uganda admitted to study Aeronautical Engineering.
                  </p>
                  <p className="mt-4 text-lg leading-8 text-gray-600">
                    This support helps cover airfare so he can begin his international academic journey.
                    The award reflects our mission to remove practical barriers and expand access to STEM
                    opportunities for high-potential students.
                  </p>
                  <Link href="/news" className="mt-8 btn-primary"><Icon name="arrow-right" className="h-4 w-4"/>Read Full Story</Link>
                </div>
              </div>
            </section>

            {/* Partners — a monochrome strip rather than a grid of boxed tiles, so
                 the list reads as ongoing and no single brand palette dominates. */}
            <section className="section-tight bg-white">
              <div className="container-page">
                <div className="section-head">
                  <p className="eyebrow">Our Partners</p>
                  <h2>Building impact through collaboration</h2>
                  <p className="lede">
                    Schools, universities, and organisations who make the programs possible &mdash;
                    opening labs, classrooms, and career pathways to students who would not otherwise
                    reach them.
                  </p>
                </div>
              </div>

              <PartnerMarquee />

              <div className="container-page">
                <p className="mt-12 text-center text-charcoal-600">
                  Want to partner with us?{' '}
                  <Link
                    href="/contact"
                    className="font-bold text-orange-700 underline underline-offset-4"
                  >
                    Get in touch
                  </Link>
                  .
                </p>
              </div>
            </section>

            <Testimonials />

            {/* Founder's Vision — statement-led. The portrait drops to an attribution
                 avatar so the vision itself carries the section, not the photograph. */}
            <section className="relative overflow-hidden bg-white py-14 md:py-18">
              <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" aria-hidden="true"></div>

              <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="star" className="h-4 w-4"/>
                  {' '}Founder&rsquo;s Vision
                </p>

                <blockquote className="sr-fade-up mt-7">
                  <p className="text-xl font-bold leading-snug tracking-tight text-gray-900 sm:text-2xl lg:text-[1.75rem] lg:leading-snug">
                    Our goal is not only to support students, but to empower them to become{' '}
                    <span className="text-orange-700">leaders and problem solvers</span> in their
                    communities and beyond.
                  </p>
                </blockquote>

                <p className="sr-fade-up mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600">
                  Jdiobe STEM Foundation was founded on the belief that talent is everywhere, but
                  opportunity is not. Led by Dr. Muwanika Jdiobe, an aerospace engineer and educator,
                  the foundation works to bridge the gap between potential and access through education,
                  mentorship, and innovation.
                </p>

                <figure className="sr-fade-up mt-9 flex items-center justify-center gap-4 pt-10">
                  <img src="/images/muwanika.jpg" alt="Dr. Muwanika Jdiobe" className="h-16 w-16 shrink-0 rounded-full object-cover object-top ring-2 ring-white" width="128" height="128" loading="lazy" decoding="async"/>
                  <figcaption className="text-left">
                    <p className="font-bold leading-tight text-gray-900">Dr. Muwanika Jdiobe</p>
                    <p className="mt-0.5 text-sm leading-tight text-orange-700">
                      Founder &amp; Executive Director &middot; Aerospace Engineer &amp; Educator
                    </p>
                  </figcaption>
                </figure>
              </div>
            </section>

            <section id="get-involved" className="py-14">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-3xl text-center md:text-left">
                  <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Get Involved</p>
                  <h2 className="sr-fade-up mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    You can help open doors for the next generation
                  </h2>
                </div>
                <div className="mt-9 grid gap-10 pt-9 lg:grid-cols-2 lg:gap-16">
                  <div className="sr-fade-up lg:pr-16">
                    <h3 className="text-2xl font-semibold text-orange-700">Sponsor a Student</h3>
                    <p className="mt-4 text-base leading-7 text-gray-600">
                      Help cover tuition, materials, and travel for a student pursuing a future in science,
                      technology, engineering, or mathematics.
                    </p>
                    <Link href="/donate" className="mt-8 btn-primary">Sponsor Now <Icon name="arrow-right" className="h-4 w-4"/></Link>
                  </div>
                  <div className="sr-fade-up lg:pl-16">
                    <h3 className="text-2xl font-semibold text-orange-700">Partner With Us</h3>
                    <p className="mt-4 text-base leading-7 text-gray-600">
                      Collaborate with us as a school, university, or organization to expand mentorship,
                      scholarships, and opportunity for underserved students.
                    </p>
                    <Link href="/contact" className="mt-8 btn-ghost">Become a Partner <Icon name="arrow-right" className="h-4 w-4"/></Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white py-14">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-9 lg:grid-cols-2">
                  <div className="sr-fade-up text-center md:text-left">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Looking Ahead</p>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                      Expanding access through innovation, partnerships, and long term vision
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-charcoal-600">
                      The next phase of our work broadens both what students can study and how far those
                      studies can take them.
                    </p>
                  </div>
                  <ul className="sr-fade-up self-center lg:pl-4">
                    <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                      <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-700"/>
                      {' '}Advanced STEM workshops
                    </li>
                    <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                      <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-700"/>
                      {' '}Innovation initiatives
                    </li>
                    <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                      <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-700"/>
                      {' '}Environmental monitoring projects
                    </li>
                    <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                      <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-700"/>
                      {' '}International academic collaborations
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Closing CTA. Photographic background with a dark scrim so the copy
                 stays legible over any part of the image. */}
            <section className="on-dark-surface relative isolate overflow-hidden py-12 md:py-14">
              <img src="/images/185A1601-scaled.jpg" alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover object-center" width="1920" height="1080" loading="lazy" decoding="async"/>
              <div className="absolute inset-0 -z-10 bg-slate-950/70" aria-hidden="true"></div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-orange-950/60 via-transparent to-slate-950/40" aria-hidden="true"></div>

              <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
                <h2 className="sr-fade-up text-3xl font-bold tracking-tight text-white drop-shadow-card sm:text-5xl">
                  Every student deserves the opportunity to learn, innovate, and succeed
                </h2>
                <p className="sr-fade-up mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/85">
                  Join us in building the next generation of STEM leaders through scholarships,
                  mentorship, and practical opportunity.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-4">
                  <Link href="/donate" className="sr-fade-up btn-primary">Donate Today</Link>
                  <a href="#get-involved" className="sr-fade-up btn-outline-on-brand">Get Involved</a>
                </div>
              </div>
            </section>
          </main>

          {/* Anchor target for #contact links on this page (scrolls to the real footer) */}
          <div id="contact" aria-hidden="true"></div>
    </>
  );
}
