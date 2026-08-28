import Link from 'next/link';
import { text } from '@/lib/site-content';
import Icon from '@/components/Icon';

export default function SouthSudanContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
      {/*
          NOTE: the programme copy on this page is structural placeholder text written to
          match the site's voice and layout. Replace with the foundation's actual South
          Sudan activities, partner names, locations, and dates before publishing.
        */}
        <main>
          {/* Full-bleed photographic hero. The image sits above surface-brand's flat
               colour; the gradient over it keeps the headline legible regardless of
               what part of the photo lands behind the text. */}
          <section className="on-dark-surface relative -mt-[5.5rem] md:-mt-24 flex min-h-[70vh] items-center overflow-hidden bg-charcoal-900 pb-16 pt-[9.5rem] text-white">
            <img src="/images/185A1601-scaled.jpg" alt="Students gathered together at a foundation community programme" className="absolute inset-0 h-full w-full object-cover object-top" width="1920" height="1080" loading="eager" decoding="sync" fetchPriority="high"/>
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/90 via-charcoal-950/70 via-55% to-charcoal-900/40" aria-hidden="true"></div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
                  <Icon name="map-pin" className="h-4 w-4"/>
                  {' '}Areas of Operation
                </p>
                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight drop-shadow-card sm:text-5xl lg:text-[3.5rem]">
                  South Sudan
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">{text(blocks, "p.extending-the-foundation-s-work", "Extending the foundation's work beyond Uganda. In South Sudan we focus on the earliest barriers to STEM — access to teaching, equipment, and a reason to believe a technical career is possible.")}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/donate" className="btn-on-brand">
                    Support This Work
                  </Link>
                  <Link href="/contact" className="btn-outline-on-brand">
                    Partner With Us
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/*
            ============================ PLACEHOLDER DATA ============================
            Stats band straddling the hero / next-section boundary.

            THESE NUMBERS ARE INVENTED PLACEHOLDERS. I had no figures for South Sudan
            operations. Replace every data-target below with real counts (or delete
            this whole block) before this page goes live — publishing fabricated
            figures to donors is worse than showing none.
            =========================================================================
          */}
          <div className="relative z-20 -mt-20 px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-lg bg-white p-8 shadow-card sm:p-10">
              <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
                <div className="lg:px-8 lg:first:pl-0">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="0" data-suffix="+">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Students Reached</dd>
                </div>
                <div className="lg:px-8">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="0">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Partner Schools</dd>
                </div>
                <div className="lg:px-8">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="0">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Teachers Trained</dd>
                </div>
                <div className="lg:px-8 lg:last:pr-0">
                  <dt className="text-4xl font-bold tabular-nums tracking-tight text-orange-600 sm:text-5xl">
                    <span className="counter" data-target="0">0</span>
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-stone-600">Community Programmes</dd>
                </div>
              </dl>
            </div>
          </div>

          <section className="bg-white pb-14 pt-20 md:pb-16 md:pt-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.our-approach", "Our approach")}</p>
                <h2 className="sr-fade-up mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.building-the-foundations-first", "Building the foundations first")}</h2>
                <p className="sr-fade-up mt-4 text-lg leading-relaxed text-stone-600">{text(blocks, "p.we-start-where-the-need", "We start where the need is most basic and build upward — working with local schools and partners rather than around them.")}</p>
              </div>

              <div className="sr-fade-up mt-9 grid gap-x-10 gap-y-8 pt-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xl font-bold text-orange-700">Access</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.getting-learning-materials-and-basic", "Getting learning materials and basic equipment into classrooms that have neither.")}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-700">Teaching</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.supporting-teachers-with-practical-stem", "Supporting teachers with practical STEM training they can apply immediately.")}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-700">Mentorship</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.connecting-students-to-people-who", "Connecting students to people who have walked the path they are considering.")}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-700">Pathways</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.opening-routes-to-further-study", "Opening routes to further study, regionally and internationally.")}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-14 md:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <div className="sr-fade-up overflow-hidden rounded-lg">
                <img src="/images/teachers.jpeg" alt="Teachers taking part in a foundation training session" className="h-[400px] w-full object-cover" loading="lazy" decoding="async"/>
              </div>
              <div className="sr-fade-up">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Programme</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.teacher-support-and-training", "Teacher support and training")}</h2>
                <p className="mt-6 text-lg leading-8 text-stone-600">{text(blocks, "p.the-fastest-way-to-reach", "The fastest way to reach many students is through the person already standing in front of them. We work with teachers on practical STEM instruction, low-cost demonstrations, and shared materials.")}</p>
                <ul className="mt-8 space-y-3 pt-6">
                  <li className="flex items-start gap-3 text-base text-stone-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>
                    {' '}Practical training sessions for science teachers
                  </li>
                  <li className="flex items-start gap-3 text-base text-stone-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>
                    {' '}Teaching materials built for low-resource classrooms
                  </li>
                  <li className="flex items-start gap-3 text-base text-stone-700">
                    <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>
                    {' '}Ongoing contact rather than one-off visits
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-white py-14 md:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <div className="sr-fade-up overflow-hidden rounded-lg lg:order-2">
                <img src="/images/inspect.jpeg" alt="Students examining a STEM project at an exhibition" className="h-[400px] w-full object-cover" loading="lazy" decoding="async"/>
              </div>
              <div className="sr-fade-up lg:order-1">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Programme</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.access-to-equipment-and-materials", "Access to equipment and materials")}</h2>
                <p className="mt-6 text-lg leading-8 text-stone-600">{text(blocks, "p.practical-science-needs-practical-things", "Practical science needs practical things. We supply kits and materials that let a classroom run real experiments, chosen for durability and for what can be repaired or replaced locally.")}</p>
                <Link href="/contact" className="mt-8 btn-primary">
                  Get in touch <Icon name="arrow-right" className="h-4 w-4"/>
                </Link>
              </div>
            </div>
          </section>

          <section className="surface-brand py-14 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid gap-9 lg:grid-cols-2 lg:gap-16">
                <div className="sr-fade-up">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">{text(blocks, "p.looking-ahead", "Looking ahead")}</p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "h2.growing-this-work-responsibly", "Growing this work responsibly")}</h2>
                  <p className="mt-6 text-lg leading-8 on-brand-muted">{text(blocks, "p.we-would-rather-do-a", "We would rather do a small amount well and grow from proof than announce more than we can sustain.")}</p>
                </div>
                <ul className="sr-fade-up self-center lg:pl-4">
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}Local partner schools and organisations
                  </li>
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}A first scholarship intake
                  </li>
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}Cross-border mentorship with Uganda cohorts
                  </li>
                  <li className="flex items-center gap-4 py-4 text-lg font-semibold">
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-orange-200"/>
                    {' '}Regional STEM exhibitions
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="py-14">
            <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
              <h2 className="sr-fade-up text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{text(blocks, "h2.help-us-reach-further", "Help us reach further")}</h2>
              <p className="sr-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">{text(blocks, "p.whether-as-a-donor-a", "Whether as a donor, a school, or a partner organisation — get in touch about the work in South Sudan.")}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/donate" className="sr-fade-up btn-primary">
                  Donate Today
                </Link>
                <Link href="/contact" className="sr-fade-up btn-ghost">
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </main>
    </>
  );
}
