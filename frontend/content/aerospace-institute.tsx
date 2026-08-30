import Link from 'next/link';
import { text } from '@/lib/blocks';
import Icon from '@/components/Icon';

/*
 * The Aerospace Institute does not exist yet — it is a facility the foundation
 * intends to build. Every claim on this page is therefore written in the future
 * tense and the "not open yet" status is stated in the first screen, so a
 * prospective student or donor cannot mistake the plan for a running programme.
 *
 * The build phases below are structural: they describe the sequence, not dates.
 * Add real milestones, a site location, and an intake date here once they are
 * agreed — but do not invent them.
 */
export default function AerospaceInstituteContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <main>
      {/*
        No page hero and no breadcrumb here — the heading below is the h1 and the
        first thing on the page. `body` already pads for the fixed masthead, and
        as `main`'s first section this one is exempt from the seam shadow that
        separates the sections further down.

        Intro — carries the page title and the status of the project.
      */}
      <section className="bg-white pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-14">
            <div className="lg:col-span-3">
              <h1 className="mt-3 text-4xl">{text(blocks, "h1.welcome-to-the-institute", "Welcome to the institute")}</h1>

              

              <p className="mt-6 text-lg leading-relaxed text-slate-600">{text(blocks, "p.the-aerospace-institute-is-the", "The Aerospace Institute is the foundation's next major build: a dedicated home for aerospace education, research, and industry partnership. It has not opened yet. Programme design and partner agreements are the work in front of us now, and the doors will open once the facility and the curriculum are both ready.")}</p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{text(blocks, "p.when-it-does-open-the", "When it does open, the institute will run focused pathways for students who want to work in aviation and space technology — rigorous fundamentals, hands-on build-and-test cycles, and the professional habits that transfer to university and the workforce.")}</p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{text(blocks, "p.we-are-publishing-the-plan", "We are publishing the plan early on purpose. The schools, universities, and industry partners who join now are the ones who will shape what gets built.")}</p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">
                  Partner with us
                </Link>
                <Link href="/donate" className="btn-secondary">
                  Support the build
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2">
              <figure className="overflow-hidden rounded-2xl shadow-card">
                <img
                  src="/images/plane.jpg"
                  alt="A commercial airliner on approach"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[4/5]"
                  width="800"
                  height="1000"
                />
                <figcaption className="bg-cream-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                  Everything that keeps this aircraft in the air — the aerodynamics, the structures,
                  the maintenance discipline — is what the institute will teach.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* What students will study — the curriculum shape, stated as intent. */}
      <section className="surface-cream py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="sr-fade-up rule-brand text-3xl">{text(blocks, "h2.what-students-will-study", "What students will study")}</h2>
            <p className="sr-fade-up mt-4 text-lg leading-relaxed text-slate-600">{text(blocks, "p.four-strands-taught-together-rather", "Four strands, taught together rather than in sequence — a student should be flying, measuring, and arguing about a design in the same term.")}</p>
          </div>

          <div className="sr-stagger mt-10 grid gap-5 sm:grid-cols-2">
            <div className="sr-fade-up rounded-2xl bg-white p-6 shadow-card">
              <Icon name="navigation" className="h-6 w-6 text-orange-700" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.flight-science", "Flight science")}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.aerodynamics-propulsion-stability-and-mission", "Aerodynamics, propulsion, stability, and mission design — the physics a vehicle has to obey before anyone builds one.")}</p>
            </div>
            <div className="sr-fade-up rounded-2xl bg-white p-6 shadow-card">
              <Icon name="shield" className="h-6 w-6 text-orange-700" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.safety-systems", "Safety & systems")}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.systems-thinking-testing-discipline-and", "Systems thinking, testing discipline, and operations awareness. How aircraft are certified, maintained, and flown without incident.")}</p>
            </div>
            <div className="sr-fade-up rounded-2xl bg-white p-6 shadow-card">
              <Icon name="tool" className="h-6 w-6 text-orange-700" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.design-fabrication", "Design & fabrication")}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.drawing-machining-and-assembling-real", "Drawing, machining, and assembling real parts — materials and structures learned at the bench rather than only on the page.")}</p>
            </div>
            <div className="sr-fade-up rounded-2xl bg-white p-6 shadow-card">
              <Icon name="activity" className="h-6 w-6 text-orange-700" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.data-control", "Data & control")}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.instrumentation-avionics-and-flight-data", "Instrumentation, avionics, and flight data. Reading what a test actually told you and changing the design because of it.")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* What the site will hold — facilities, clearly labelled as planned. */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="section-head">
            <p className="sr-fade-up eyebrow">{text(blocks, "p.planned-facilities", "Planned facilities")}</p>
            <h2 className="sr-fade-up text-3xl">{text(blocks, "h2.what-we-intend-to-build", "What we intend to build")}</h2>
            <p className="sr-fade-up lede">{text(blocks, "p.three-things-the-region-does", "Three things the region does not currently have in one place, and the reason the institute is worth building at all.")}</p>
          </div>

          <div className="sr-stagger grid gap-6 md:grid-cols-3">
            <article className="sr-fade-up group overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                <img src="/images/catapilar.jpeg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" width="800" height="600" />
              </div>
              <div className="p-7">
                <Icon name="cpu" className="h-8 w-8 text-orange-700" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.engineering-studios", "Engineering studios")}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.design-fabrication-and-integration-space", "Design, fabrication, and integration space where a cohort can take a vehicle from sketch to flight test without leaving the building.")}</p>
              </div>
            </article>
            <article className="sr-fade-up group overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                <img src="/images/robot.jpeg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" width="800" height="600" />
              </div>
              <div className="p-7">
                <Icon name="zap" className="h-8 w-8 text-orange-700" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.research-lab", "Research lab")}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.mentored-r-d-unmanned-systems", "Mentored R&D — unmanned systems, materials, and instrumentation — carried from a question through validation to a paper students can defend.")}</p>
              </div>
            </article>
            <article className="sr-fade-up group overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                <img src="/images/inspect.jpeg" alt="" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" width="800" height="600" />
              </div>
              <div className="p-7">
                <Icon name="users" className="h-8 w-8 text-orange-700" />
                <h3 className="mt-4 text-lg font-bold text-slate-900">{text(blocks, "h3.partner-network", "Partner network")}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text(blocks, "p.standing-links-to-universities-aviation", "Standing links to universities, aviation firms, and alumni so internships, guest teaching, and equipment are part of the institute, not favours.")}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/*
        Build sequence. Deliberately ordered rather than dated — the foundation
        has no funded completion date to publish, and a date we miss costs more
        credibility than one we never gave. Replace with real milestones only
        when they are committed.
      */}
      <section className="surface-cream py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="section-head">
            <p className="sr-fade-up eyebrow">{text(blocks, "p.the-road-there", "The road there")}</p>
            <h2 className="sr-fade-up text-3xl">{text(blocks, "h2.how-the-institute-gets-built", "How the institute gets built")}</h2>
            <p className="sr-fade-up lede">{text(blocks, "p.four-stages-in-order-we", "Four stages, in order. We will publish an opening date here once the site and the funding for it are both secured — not before.")}</p>
          </div>

          <ol className="stage-list sr-stagger">
            <li className="stage-item sr-fade-up">
              <span className="stage-number" aria-hidden="true">1</span>
              <div>
                <p className="chip mb-2">Underway</p>
                <h3 className="stage-title">{text(blocks, "h3.curriculum-and-partnerships", "Curriculum and partnerships")}</h3>
                <p className="stage-text">{text(blocks, "p.designing-the-pathways-with-practising", "Designing the pathways with practising engineers, and signing the university and industry partners who will teach, examine, and hire from them.")}</p>
              </div>
            </li>
            <li className="stage-item sr-fade-up">
              <span className="stage-number" aria-hidden="true">2</span>
              <div>
                <p className="chip mb-2">Next</p>
                <h3 className="stage-title">{text(blocks, "h3.site-and-funding", "Site and funding")}</h3>
                <p className="stage-text">{text(blocks, "p.securing-the-land-the-workshop", "Securing the land, the workshop and lab build, and the capital behind it. This is the stage donors and sponsors move fastest.")}</p>
              </div>
            </li>
            <li className="stage-item sr-fade-up">
              <span className="stage-number" aria-hidden="true">3</span>
              <div>
                <p className="chip mb-2">Planned</p>
                <h3 className="stage-title">{text(blocks, "h3.pilot-cohort", "Pilot cohort")}</h3>
                <p className="stage-text">{text(blocks, "p.a-small-first-intake-run", "A small first intake run out of partner facilities, so the teaching is tested on real students before the full institute opens.")}</p>
              </div>
            </li>
            <li className="stage-item sr-fade-up">
              <span className="stage-number" aria-hidden="true">4</span>
              <div>
                <p className="chip mb-2">Planned</p>
                <h3 className="stage-title">{text(blocks, "h3.the-institute-opens", "The institute opens")}</h3>
                <p className="stage-text">{text(blocks, "p.full-intake-the-research-programme", "Full intake, the research programme running, and placements with the partners built up in stage one.")}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Close — the ask, matched to who is reading. */}
      <section className="surface-brand py-14">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="sr-fade-up text-3xl">{text(blocks, "h2.help-us-build-it", "Help us build it")}</h2>
          <p className="mt-4 text-lg text-orange-100">{text(blocks, "p.the-institute-is-not-open", "The institute is not open, so there is nothing to apply to yet — but there is plenty to join. Schools and universities can shape the curriculum, firms can offer equipment, teaching, or placements, and donors can move the site forward.")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-on-brand">
              Talk to us about partnering
            </Link>
            <Link href="/donate" className="btn-outline-on-brand">
              Support the build
            </Link>
          </div>
          <p className="mt-6 text-sm text-orange-100">
            Want to hear when applications open? Tell us on the{' '}
            <Link href="/contact" className="underline underline-offset-4">contact page</Link>{' '}
            and we will write to you first.
          </p>
        </div>
      </section>
    </main>
  );
}
