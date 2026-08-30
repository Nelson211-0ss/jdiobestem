import Link from 'next/link';
import { text } from '@/lib/blocks';
import Icon from '@/components/Icon';

export default function UgandaContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
      <main>
          {/* Pulled up behind the fixed nav (cancelling the 6rem body offset) so the
               transparent header sits on orange. */}
          {/* Full-bleed photographic hero. The image sits above surface-brand's flat
               colour; the gradient over it keeps the headline legible regardless of
               what part of the photo lands behind the text. */}
          <section className="on-dark-surface relative -mt-[5.5rem] md:-mt-24 flex min-h-[70vh] items-center overflow-hidden bg-charcoal-900 pb-16 pt-[9.5rem] text-white">
            <img src="/images/hero-students-community.png" alt="Students in school uniforms gathered together outdoors in Uganda, one holding a model airplane" className="absolute inset-0 h-full w-full object-cover object-center" width="1920" height="1080" loading="eager" decoding="sync" fetchPriority="high"/>
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/90 via-charcoal-950/70 via-55% to-charcoal-900/40" aria-hidden="true"></div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
                  <Icon name="map-pin" className="h-4 w-4"/>
                  {' '}Areas of Operation
                </p>
                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight drop-shadow-card sm:text-5xl lg:text-[3.5rem]">
                  Uganda
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">{text(blocks, "p.uganda-is-where-the-jdiobe", "Uganda is where the Jdiobe STEM Foundation began. We work directly with schools, teachers, and communities to remove the practical barriers that keep capable students out of science and engineering.")}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/donate" className="btn-on-brand">
                    Sponsor a Student
                  </Link>
                  <Link href="/secondary-research" className="btn-outline-on-brand">
                    The Science Fair
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/*
            Stats band straddling the hero / next-section boundary. Pulled up with a
            negative margin so it overlaps the hero's bottom padding.

            NUMBERS: these are the foundation-wide figures published on the homepage.
            Confirm they are correct *for Uganda specifically* before publishing, or
            replace with country-level counts.
          */}
          <div className="relative z-20 -mt-20 px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-lg bg-white p-8 shadow-card sm:p-10">
              <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
                <div className="lg:px-8 lg:first:pl-0">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="120" data-suffix="+">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Students Supported</dd>
                </div>
                <div className="lg:px-8">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="25">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Scholarships Awarded</dd>
                </div>
                <div className="lg:px-8">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="12">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Mentorship &amp; Training Programs</dd>
                </div>
                <div className="lg:px-8 lg:last:pr-0">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="8">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Education &amp; Industry Partnerships</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Focus areas — unboxed, divider-led */}
          <section className="bg-white pb-14 pt-20 md:pb-16 md:pt-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.on-the-ground", "On the ground")}</p>
                <h2 className="sr-fade-up mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.what-our-work-in-uganda", "What our work in Uganda looks like")}</h2>
              </div>

              <div className="sr-fade-up mt-9 grid gap-x-10 gap-y-8 pt-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xl font-bold text-orange-700">{text(blocks, "p.scholarships", "Scholarships")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.tuition-materials-and-travel-support", "Tuition, materials, and travel support so cost is never the reason a student stops.")}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-700">{text(blocks, "p.classroom-lab", "Classroom & lab")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.practical-workshops-that-connect-the", "Practical workshops that connect the syllabus to real tools and real problems.")}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-700">Mentorship</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.local-educators-and-stem-professionals", "Local educators and STEM professionals walking with each cohort through the year.")}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-700">Innovation</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.student-led-builds-in-robotics", "Student-led builds in robotics, assistive technology, and sustainable design.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Programme 1 — editorial band, image left */}
          <section className="py-14 md:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <div className="sr-fade-up overflow-hidden rounded-lg">
                <img src="/images/hero-science-fair-projects.png" alt="Students presenting science fair projects including solar wiring and microcontrollers" className="h-[400px] w-full object-cover" width="1920" height="1080" loading="lazy" decoding="async"/>
              </div>
              <div className="sr-fade-up">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Programme</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.hands-on-stem-education", "Hands-on STEM education")}</h2>
                <p className="mt-6 text-lg leading-8 text-stone-600">{text(blocks, "p.workshops-and-school-partnerships-that", "Workshops and school partnerships that put equipment in students' hands. Learners move from theory to circuits, sensors, and structures they build and test themselves.")}</p>
                <ul className="mt-8 space-y-3 pt-6">
                  <li className="flex items-start gap-3 text-base text-stone-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>
                    {' '}School-based practical sessions and science fairs
                  </li>
                  <li className="flex items-start gap-3 text-base text-stone-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>
                    {' '}Teacher training and shared teaching materials
                  </li>
                  <li className="flex items-start gap-3 text-base text-stone-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>
                    {' '}Project kits built from accessible, local materials
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Programme 2 — editorial band, image right (alternating rhythm) */}
          <section className="bg-white py-14 md:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <div className="sr-fade-up overflow-hidden rounded-lg lg:order-2">
                <img src="/images/robot.jpeg" alt="A student-built robot on a workbench during a robotics session" className="h-[400px] w-full object-cover" loading="lazy" decoding="async"/>
              </div>
              <div className="sr-fade-up lg:order-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Programme</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.student-led-innovation", "Student-led innovation")}</h2>
                <p className="mt-6 text-lg leading-8 text-stone-600">{text(blocks, "p.teams-identify-a-problem-in", "Teams identify a problem in their own community and build toward it — assistive devices, robotics, translation tools, environmental monitoring. The brief is always local.")}</p>
                <Link href="/secondary-research" className="mt-8 btn-primary">
                  Explore the projects <Icon name="arrow-right" className="h-4 w-4"/>
                </Link>
              </div>
            </div>
          </section>

          {/* Priorities */}
          <section className="surface-brand py-14 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid gap-9 lg:grid-cols-2 lg:gap-16">
                <div className="sr-fade-up">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">{text(blocks, "p.looking-ahead", "Looking ahead")}</p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "h2.where-we-are-focusing-next", "Where we are focusing next in Uganda")}</h2>
                  <p className="mt-6 text-lg leading-8 on-brand-muted">{text(blocks, "p.deepening-what-already-works-and", "Deepening what already works, and extending it to more schools and districts.")}</p>
                </div>
                <ul className="sr-fade-up self-center lg:pl-4">
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}More partner schools per district
                  </li>
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}Expanded scholarship intake
                  </li>
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}Teacher training and shared curriculum
                  </li>
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}University and industry pathways
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-14">
            <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
              <h2 className="sr-fade-up text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.support-a-student-in-uganda", "Support a student in Uganda")}</h2>
              <p className="sr-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">{text(blocks, "p.your-support-goes-directly-into", "Your support goes directly into scholarships, equipment, and mentorship for students who already have the ambition.")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/donate" className="sr-fade-up btn-primary">
                  Donate Today
                </Link>
                <Link href="/contact" className="sr-fade-up btn-ghost">
                  Partner With Us
                </Link>
              </div>
            </div>
          </section>
        </main>
    </>
  );
}
