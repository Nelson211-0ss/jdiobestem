import Link from 'next/link';
import { text } from '@/lib/site-content';
import Icon from '@/components/Icon';

export default function ScholarshipContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
      <main>
          {/* Hero */}
          <header className="page-hero">
            <img src="/images/hero-students-community.png" alt="" className="page-hero__bg object-top" width="1600" height="900"/>
            <div className="page-hero__overlay" aria-hidden="true"></div>
            <div className="page-hero__inner">
              <p className="page-hero__eyebrow">{text(blocks, "p.stem-scholarship-program", "STEM Scholarship Program")}</p>
              <h1>{text(blocks, "h1.supporting-future-stem-leaders", "Supporting future STEM leaders")}</h1>
              <p className="page-hero__lede">{text(blocks, "p.scholarships-that-reduce-financial-barriers", "Scholarships that reduce financial barriers while providing mentorship, leadership development, and professional growth for outstanding students pursuing STEM education.")}</p>
            </div>
          </header>

          {/* Scholarships */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="award" className="h-4 w-4"/>
                  {' '}Featured Scholarships
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{text(blocks, "h2.opening-doors-for-the-next", "Opening doors for the next generation")}</h2>
              </div>

              <div className="sr-stagger mt-9 grid gap-8 lg:grid-cols-3">

                {/* Dr. Ron and Cara Beer STEM Scholarship */}
                <article className="sr-fade-up flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="surface-brand p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true"><Icon name="award" className="h-6 w-6"/></span>
                      <span className="on-dark inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        <Icon name="check-circle" className="h-3.5 w-3.5"/> Applications Closed
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold md:text-2xl">{text(blocks, "h3.dr-ron-and-cara-beer", "Dr. Ron and Cara Beer STEM Scholarship")}</h3>
                    <p className="mt-2 text-sm text-orange-100">{text(blocks, "p.established-by-dr-ron-and", "Established by Dr. Ron and Cara Beer for STEM Students.")}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-base leading-7 text-slate-600">{text(blocks, "p.established-through-the-generosity-of", "Established through the generosity of Dr. Ron and Cara Beer, this scholarship helps remove financial barriers for students pursuing STEM education.")}</p>
                    <dl className="mt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="dollar-sign" className="h-4 w-4"/></span>
                        <div><dt className="text-sm font-bold text-slate-900">Award Amount</dt><dd className="text-sm text-slate-600">Varies by year</dd></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="cpu" className="h-4 w-4"/></span>
                        <div><dt className="text-sm font-bold text-slate-900">Field</dt><dd className="text-sm text-slate-600">STEM degrees</dd></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="check-circle" className="h-4 w-4"/></span>
                        <div><dt className="text-sm font-bold text-slate-900">Eligibility</dt><dd className="text-sm text-slate-600">Academic excellence, financial need, leadership potential</dd></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="gift" className="h-4 w-4"/></span>
                        <div><dt className="text-sm font-bold text-slate-900">Support Includes</dt><dd className="text-sm text-slate-600">Tuition assistance, mentorship, leadership development</dd></div>
                      </div>
                    </dl>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link href="/contact" className="btn-primary">Apply Now <Icon name="arrow-right" className="h-4 w-4"/></Link>
                      <Link href="/contact" className="btn-ghost">Learn More</Link>
                    </div>
                  </div>
                </article>

                {/* Regina Henry Scholarship */}
                <article className="sr-fade-up flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="surface-brand p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true"><Icon name="award" className="h-6 w-6"/></span>
                      <span className="on-dark inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        <Icon name="check-circle" className="h-3.5 w-3.5"/> Applications Open
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold md:text-2xl">{text(blocks, "h3.regina-henry-scholarship", "Regina Henry Scholarship")}</h3>
                    <p className="mt-2 text-sm text-orange-100">{text(blocks, "p.established-by-regina-henry", "Established by Regina Henry")}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-base leading-7 text-slate-600">{text(blocks, "p.supporting-promising-students-whose-determination", "Supporting promising students whose determination, character, and commitment to education position them to become future leaders in STEM and their communities.")}</p>
                    <p className="mt-4 text-base leading-7 text-slate-600">{text(blocks, "p.it-helps-students-continue-their", "It helps students continue their education with confidence by providing financial support, encouragement, and a stronger path toward STEM leadership.")}</p>
                    <p className="mt-5 text-sm font-bold text-slate-900">{text(blocks, "p.this-scholarship-includes", "This scholarship includes")}</p>
                    <ul className="mt-3 space-y-3">
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="dollar-sign" className="h-4 w-4"/></span>
                        {' '}Financial support
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="book-open" className="h-4 w-4"/></span>
                        {' '}Academic encouragement
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="users" className="h-4 w-4"/></span>
                        {' '}Professional mentorship
                      </li>
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-3 pt-7">
                      <Link href="/contact" className="btn-primary">Apply Now <Icon name="arrow-right" className="h-4 w-4"/></Link>
                    </div>
                  </div>
                </article>

                {/* Jdiobe STEM Scholarship */}
                <article className="sr-fade-up flex flex-col overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="surface-brand p-7">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25" aria-hidden="true"><Icon name="award" className="h-6 w-6"/></span>
                      <span className="on-dark inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                        <Icon name="check-circle" className="h-3.5 w-3.5"/> Applications Open
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold md:text-2xl">{text(blocks, "h3.jdiobe-stem-scholarship", "Jdiobe STEM Scholarship")}</h3>
                    <p className="mt-2 text-sm text-orange-100">{text(blocks, "p.our-foundation-s-flagship-scholarship", "Our foundation's flagship scholarship")}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-base leading-7 text-slate-600">{text(blocks, "p.awarded-directly-by-jdiobe-stem", "Awarded directly by Jdiobe STEM Foundation to high-potential students, removing practical barriers so they can begin or continue their STEM education journey.")}</p>
                    <p className="mt-5 text-sm font-bold text-slate-900">{text(blocks, "p.this-scholarship-includes-2", "This scholarship includes")}</p>
                    <ul className="mt-3 space-y-3">
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="dollar-sign" className="h-4 w-4"/></span>
                        {' '}Financial support
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="compass" className="h-4 w-4"/></span>
                        {' '}Travel &amp; research grants
                      </li>
                      <li className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700" aria-hidden="true"><Icon name="users" className="h-4 w-4"/></span>
                        {' '}Professional mentorship
                      </li>
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-3 pt-7">
                      <Link href="/contact" className="btn-primary">Apply Now <Icon name="arrow-right" className="h-4 w-4"/></Link>
                      <Link href="/contact" className="btn-ghost">Learn More</Link>
                    </div>
                  </div>
                </article>

              </div>
            </div>
          </section>

          {/* What every scholarship provides */}
          <section className="bg-white py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="heart" className="h-4 w-4"/>
                  {' '}More Than Tuition
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{text(blocks, "h2.support-that-goes-beyond-the", "Support that goes beyond the classroom")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="dollar-sign" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{text(blocks, "h3.tuition-assistance", "Tuition Assistance")}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text(blocks, "p.reducing-the-financial-barriers-to", "Reducing the financial barriers to STEM education.")}</p>
                </div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="users" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">Mentorship</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text(blocks, "p.guidance-from-engineers-scientists-and", "Guidance from engineers, scientists, and educators.")}</p>
                </div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="flag" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{text(blocks, "h3.leadership-development", "Leadership Development")}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text(blocks, "p.building-the-skills-to-lead", "Building the skills to lead in STEM and community.")}</p>
                </div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="trending-up" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">{text(blocks, "h3.professional-growth", "Professional Growth")}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text(blocks, "p.pathways-into-research-internships-and", "Pathways into research, internships, and careers.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="surface-brand py-14">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
              <div className="text-center md:text-left">
                <h2 className="sr-fade-up text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "h2.fund-the-future-of-stem", "Fund the future of STEM")}</h2>
                <p className="sr-fade-up mt-5 max-w-2xl text-base leading-7 text-orange-100">{text(blocks, "p.your-generosity-can-help-remove", "Your generosity can help remove financial barriers for a talented student — or establish a named scholarship of your own. Together we can turn potential into opportunity.")}</p>
              </div>
              <div className="sr-fade-up flex flex-col gap-3">
                <Link href="/donate" className="btn-on-brand">
                  <span className="inline-flex items-center gap-2"><Icon name="heart" className="h-4 w-4"/> Sponsor a Student</span><span aria-hidden="true">&rarr;</span>
                </Link>
                <Link href="/contact" className="btn-outline-on-brand">
                  <span className="inline-flex items-center gap-2"><Icon name="award" className="h-4 w-4"/> Establish a Scholarship</span><span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </section>

        </main>
    </>
  );
}
