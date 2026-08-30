import Link from 'next/link';
import Icon from '@/components/Icon';
import { text } from '@/lib/site-content';
import SocialIcon from '@/components/SocialIcon';

/**
 * About.
 *
 * There is no hero: the page opens on Our Story, whose heading is the page's
 * h1. The layout is bespoke and stays here; the words come from the `page-blocks`
 * table under the page name "about". Every call to `text()` carries the
 * original copy as its fallback, so an unreachable API or a block nobody has
 * filled in renders exactly what was written here rather than a gap.
 */
export default function AboutContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
        <main>
          {/* Our Story — the copy is a problem/response argument, so it is set that
               way: a lead statement, a full-bleed image band, then the barrier and our
               response side by side, closing on the belief that follows from both. */}
          <section className="relative overflow-hidden bg-white py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <header className="sr-fade-up max-w-3xl">
                <h1 className="mt-3">{text(blocks, "origin.heading", "Why we began")}</h1>
              </header>

              {/* Lead statement paired with the photo. The photo takes an equal
                   half and is lifted above the paragraph's line, so it reads
                   alongside the heading rather than trailing the text. */}
              <div className="mt-5 grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
                <p className="sr-fade-up text-lg leading-relaxed text-gray-700 sm:text-xl sm:leading-relaxed lg:col-span-6">
                  Jdiobe STEM Foundation was established to address a simple but urgent reality: many
                  talented students in underserved communities have the ability to succeed in science,
                  technology, engineering, and mathematics, but{' '}
                  <span className="font-semibold text-orange-700">lack the resources and support</span>
                  {' '}needed to pursue that path.
                </p>

                <figure className="sr-fade-up overflow-hidden rounded-lg lg:col-span-6 lg:-mt-14">
                  <img src="/images/1718038140753.jpeg" alt="A student in school uniform wiring a servo and breadboard project at a classroom desk" className="aspect-[5/4] w-full object-cover object-center" width="1200" height="800" loading="lazy" decoding="async"/>
                </figure>
              </div>

              {/* The barrier / our response */}
              <div className="mt-10 grid gap-10 pt-9 lg:grid-cols-2 lg:gap-0">
                <div className="sr-fade-up lg:pr-14">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-stone-500" aria-hidden="true">
                      <Icon name="alert-circle" className="h-5 w-5"/>
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">The barrier</h3>
                  </div>
                  <p className="mt-5 text-base leading-8 text-gray-600">{text(blocks, "origin.para1", "For many students, the barrier is not ability. It is the cost of education, limited exposure to STEM careers, lack of mentorship, and the absence of professional networks that can help them imagine and prepare for a different future.")}</p>
                </div>

                <div className="sr-fade-up lg:pl-14">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-orange-700" aria-hidden="true">
                      <Icon name="arrow-right-circle" className="h-5 w-5"/>
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Our response</h3>
                  </div>
                  <p className="mt-5 text-base leading-8 text-gray-600">{text(blocks, "origin.para2", "The foundation was created to help close that gap. Our work focuses on supporting students not only with financial assistance, but also with guidance, encouragement, and real world exposure that helps them build confidence and direction.")}</p>
                </div>
              </div>

              {/* Closing belief */}
              <p className="sr-fade-up mt-10 max-w-4xl rounded-xl bg-cream-200 px-6 py-4 text-lg font-semibold leading-8 text-gray-900 sm:text-xl sm:leading-9">{text(blocks, "origin.para3", "We believe that when students are given access to opportunity, they can become engineers, scientists, researchers, entrepreneurs, educators, and problem solvers who strengthen their communities and contribute to global progress.")}</p>

              {/* Focus areas as inline pills rather than a boxed list */}
              <div className="sr-fade-up mt-9 pt-8">
               
              </div>
            </div>
          </section>

          {/* Mission & Vision — the section itself carries the brand surface, so the
               two statements sit unboxed and are separated by a rule rather than by
               panels floating on a tinted background. */}
          <section className="surface-brand relative overflow-hidden py-14 md:py-18">
            <div className="pointer-events-none absolute -right-40 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true"></div>
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/[0.07] blur-3xl" aria-hidden="true"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="sr-fade-up max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">{text(blocks, "mission.eyebrow", "What drives us")}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "mission.heading", "Mission & Vision")}</h2>
              </div>

              <div className="mt-10 grid gap-9 pt-9 lg:grid-cols-2 lg:gap-0">
                <div className="sr-fade-up lg:pr-16">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25" aria-hidden="true">
                      <Icon name="target" className="h-5 w-5 text-white"/>
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-100">Mission</h3>
                  </div>
                  <p className="mt-6 text-xl font-semibold leading-relaxed text-white sm:text-2xl sm:leading-relaxed">{text(blocks, "mission.mission", "To empower underserved students through access to STEM education, scholarships, mentorship, and innovation driven opportunities that prepare them to become future leaders and problem solvers.")}</p>
                </div>

                <div className="sr-fade-up lg:pl-16">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25" aria-hidden="true">
                      <Icon name="eye" className="h-5 w-5 text-white"/>
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-100">Vision</h3>
                  </div>
                  <p className="mt-6 text-xl font-semibold leading-relaxed text-white sm:text-2xl sm:leading-relaxed">{text(blocks, "mission.vision", "A world where every student, regardless of background, has the opportunity to access quality STEM education and contribute to solving local and global challenges.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Founder&rsquo;s Journey — narrative rail. The story is four distinct
               chapters, so it is numbered and threaded on a vertical line rather than
               set as one block of prose beside a portrait. */}
          <section className="relative overflow-hidden bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <header className="sr-fade-up max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "founder.eyebrow", "Founder’s Journey")}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{text(blocks, "founder.heading", "A foundation shaped by education, engineering, and service")}</h2>
              </header>

              <div className="mt-10 grid items-start gap-9 lg:grid-cols-12 lg:gap-16">
                {/* Portrait rail */}
                <aside className="sr-fade-up lg:col-span-4 lg:sticky lg:top-28">
                  <div className="overflow-hidden rounded-lg">
                    <img src="/images/muwanika.jpg" alt="Dr. Muwanika Jdiobe, founder of Jdiobe STEM Foundation" className="aspect-[4/5] w-full object-cover object-top" width="448" height="560" loading="lazy" decoding="async"/>
                  </div>
                  <p className="mt-5 text-xl font-bold tracking-tight text-gray-900">Dr. Muwanika Jdiobe</p>
                  <p className="mt-1 text-sm font-semibold text-orange-700">Founder &amp; Executive Director</p>

                  <ul className="mt-6 space-y-3 pt-5" aria-label="Founder credentials">
                    <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <Icon name="award" className="h-4 w-4 shrink-0 text-orange-500"/>
                      {' '}Ph.D., Aerospace Engineering
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <Icon name="briefcase" className="h-4 w-4 shrink-0 text-orange-500"/>
                      {' '}The Boeing Company
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                      <Icon name="book-open" className="h-4 w-4 shrink-0 text-orange-500"/>
                      {' '}Oklahoma State University
                    </li>
                  </ul>
                </aside>

                {/* Narrative rail: numbered chapters threaded on a vertical line */}
                <ol className="sr-stagger relative lg:col-span-8">
                  <span className="pointer-events-none absolute left-[1.4rem] top-3 bottom-3 hidden w-px bg-orange-200 sm:block" aria-hidden="true"></span>

                  <li className="sr-fade-up relative pb-10 sm:pl-20">
                    <span className="absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-orange-700 sm:flex shadow-card" aria-hidden="true">01</span>
                    <h3 className="text-lg font-bold text-gray-900">The founding</h3>
                    <p className="mt-3 text-base leading-8 text-gray-600">{text(blocks, "founder.para1", "Jdiobe STEM Foundation was founded by Dr. Muwanika Jdiobe, an aerospace engineer, educator, and researcher committed to expanding access to STEM education globally.")}</p>
                  </li>

                  <li className="sr-fade-up relative pb-10 sm:pl-20">
                    <span className="absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-orange-700 sm:flex shadow-card" aria-hidden="true">02</span>
                    <h3 className="text-lg font-bold text-gray-900">Engineering and academia</h3>
                    <p className="mt-3 text-base leading-8 text-gray-600">{text(blocks, "founder.para2", "His background in engineering and academia shaped the foundation’s belief that education should connect knowledge with real world opportunity. Through his own academic and professional journey, Dr. Jdiobe recognized how mentorship, exposure, and support can change what a student believes is possible.")}</p>
                  </li>

                  <li className="sr-fade-up relative pb-10 sm:pl-20">
                    <span className="absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-orange-700 sm:flex shadow-card" aria-hidden="true">03</span>
                    <h3 className="text-lg font-bold text-gray-900">A conviction, made concrete</h3>
                    <p className="mt-3 text-base leading-8 text-gray-600">{text(blocks, "founder.para3", "The foundation reflects that conviction. It is designed to help students access education, develop confidence, connect with mentors, and pursue STEM pathways that can transform their futures.")}</p>
                  </li>

                  <li className="sr-fade-up relative sm:pl-20">
                    <span className="absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white sm:flex" aria-hidden="true">04</span>
                    <h3 className="text-lg font-bold text-gray-900">From Uganda, across borders</h3>
                    <p className="mt-3 text-base leading-8 text-gray-600">{text(blocks, "founder.para4", "Dr. Jdiobe’s journey from the classrooms of Uganda to earning a Ph.D. in Mechanical and Aerospace Engineering in the United States inspired a vision to give back. What began as personal outreach grew into a cross-border nonprofit bridging continents, resources, and ideas for the next generation of STEM leaders.")}</p>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl text-center md:text-left">
                <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Our Values</p>
                <h2 className="sr-fade-up mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{text(blocks, "values.heading", "The principles that guide our work")}</h2>
              </div>

              <div className="sr-stagger mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="sr-fade-up rounded-lg surface-brand p-6 ring-1 ring-white/15">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true">
                    <Icon name="unlock" className="h-5 w-5 text-white"/>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Access</h3>
                  <p className="mt-4 text-sm leading-6 text-orange-50">{text(blocks, "values.access", "We believe capable students should not be limited by financial barriers, geography, or lack of exposure.")}</p>
                </div>
                <div className="sr-fade-up rounded-lg surface-brand p-6 ring-1 ring-white/15">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true">
                    <Icon name="users" className="h-5 w-5 text-white"/>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Mentorship</h3>
                  <p className="mt-4 text-sm leading-6 text-orange-50">{text(blocks, "values.mentorship", "We believe guidance from educators, professionals, and role models can change the direction of a student’s life.")}</p>
                </div>
                <div className="sr-fade-up rounded-lg surface-brand p-6 ring-1 ring-white/15">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true">
                    <Icon name="zap" className="h-5 w-5 text-white"/>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Innovation</h3>
                  <p className="mt-4 text-sm leading-6 text-orange-50">{text(blocks, "values.innovation", "We encourage students to use STEM knowledge to solve real problems in their communities and beyond.")}</p>
                </div>
                <div className="sr-fade-up rounded-lg surface-brand p-6 ring-1 ring-white/15">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true">
                    <Icon name="heart" className="h-5 w-5 text-white"/>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Service</h3>
                  <p className="mt-4 text-sm leading-6 text-orange-50">{text(blocks, "values.sustainability", "We are committed to building opportunities that create lasting impact for students, families, and communities.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Where We Work — place-led. The locations are the subject, so they are
               the layout rather than a sidebar list, and the two that have their own
               pages link straight through. */}
          <section className="relative overflow-hidden bg-cream-100 py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <header className="sr-fade-up max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "where.eyebrow", "Where We Work")}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{text(blocks, "where.heading", "Rooted in Uganda, connected to global opportunity")}</h2>
              </header>

              <div className="mt-6 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                  <p className="sr-fade-up text-lg leading-relaxed text-gray-700">
                    With its unique cross-border structure &mdash;{' '}
                    <span className="font-semibold text-orange-700">registered in the United States and operating in Uganda</span>
                    {' '}&mdash; the Foundation bridges continents, resources, and ideas.
                  </p>
                  <p className="sr-fade-up mt-4 text-base leading-8 text-gray-600">{text(blocks, "where.para", "Our goal is to connect local talent with the resources, mentorship, and learning experiences needed to participate in a global STEM future. Our work continues to grow through partnerships with schools, universities, and communities united by the belief that brilliance exists everywhere, but opportunity must be built.")}</p>
                </div>

                <figure className="sr-fade-up overflow-hidden rounded-lg lg:col-span-5">
                  <img src="/images/185A1601-scaled.jpg" alt="Students in Uganda participating in a STEM community program" className="aspect-[4/3] w-full object-cover object-top" width="2560" height="1707" loading="lazy" decoding="async"/>
                </figure>
              </div>

              {/* Locations. Uganda and South Sudan link to their own pages; the other
                   two are structural rather than programme locations. */}
              <div className="mt-10 pt-9">
                <p className="sr-fade-up eyebrow">Areas of operation</p>

                <div className="sr-stagger mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Link href="/uganda" className="sr-fade-up group flex flex-col rounded-lg bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-900/10 shadow-card">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true">
                      <Icon name="map-pin" className="h-5 w-5"/>
                    </span>
                    <span className="mt-4 font-bold text-gray-900">Uganda</span>
                    <span className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                      Primary area of impact &mdash; scholarships, mentorship, and STEM outreach.
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700">
                      View programs <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"/>
                    </span>
                  </Link>

                  <Link href="/south-sudan" className="sr-fade-up group flex flex-col rounded-lg bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-900/10 shadow-card">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true">
                      <Icon name="map-pin" className="h-5 w-5"/>
                    </span>
                    <span className="mt-4 font-bold text-gray-900">South Sudan</span>
                    <span className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                      Teacher training, access to equipment, and mentorship pathways.
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700">
                      View programs <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"/>
                    </span>
                  </Link>

                  <div className="sr-fade-up flex flex-col rounded-lg bg-white/60 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true">
                      <Icon name="home" className="h-5 w-5"/>
                    </span>
                    <span className="mt-4 font-bold text-gray-900">United States</span>
                    <span className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                      Registered nonprofit; Oklahoma City office for administration and fundraising.
                    </span>
                  </div>

                  <div className="sr-fade-up flex flex-col rounded-lg bg-white/60 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true">
                      <Icon name="globe" className="h-5 w-5"/>
                    </span>
                    <span className="mt-4 font-bold text-gray-900">Global partnerships</span>
                    <span className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                      Schools, universities, and collaborators extending student opportunity.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Moving Forward CTA */}
          <section className="surface-brand py-14">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">{text(blocks, "forward.eyebrow", "Moving Forward")}</p>
              <h2 className="sr-fade-up mt-4 text-2xl font-bold tracking-tight sm:text-4xl">{text(blocks, "forward.heading", "We are building pathways, not just programs.")}</h2>
              <p className="sr-fade-up mx-auto mt-6 max-w-3xl text-base leading-7 text-orange-100">{text(blocks, "forward.para", "Our work is about helping students see what is possible, access the support they need, and become part of the next generation of STEM leaders.")}</p>
              <div className="sr-fade-up mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/team" className="btn-outline-on-brand">
                  <Icon name="users" className="h-4 w-4"/>
                  {' '}Meet the Team
                </Link>
                <Link href="/contact" className="btn-ghost">
                  {' '}Partner With Us
                </Link>
                <Link href="/donate" className="btn-outline-on-brand">
                  <Icon name="heart" className="h-4 w-4"/>
                  {' '}Support the Mission
                </Link>
              </div>
            </div>
          </section>

          {/* Volunteer */}
          <section className="relative bg-white py-12">
            <img src="/images/wall.jpeg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 select-none" style={{ zIndex: '1' }} aria-hidden="true"/>
            <div className="absolute inset-0 bg-white/90" style={{ zIndex: '2' }} aria-hidden="true"></div>
            <div className="relative mx-auto max-w-4xl px-4 text-center" style={{ zIndex: '3' }}>
              <div className="flex flex-col items-center p-10">
                <Icon name="heart" className="mb-4 h-12 w-12 text-orange-700"/>
                <h2 className="mb-4 text-2xl font-bold text-orange-700 sm:text-3xl">{text(blocks, "cta.heading", "Volunteer With Us")}</h2>
                <p className="mb-6 text-base text-gray-700">{text(blocks, "cta.para", "Join our mission to empower the next generation of STEM leaders. Whether you want to mentor, organize events, or support our outreach, your contribution makes a difference!")}</p>
                <Link href="/volunteers" className="btn-primary">Apply to Volunteer</Link>
              </div>
            </div>
          </section>
        </main>
    </>
  );
}
