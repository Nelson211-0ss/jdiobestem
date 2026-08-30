import Link from 'next/link';
import { text } from '@/lib/blocks';
import { type SiteTeamMember } from '@/lib/site-content';
import FeatureIcon from '@/components/FeatureIcon';
import Icon from '@/components/Icon';
import VolunteerForm from '@/components/VolunteerForm';

/**
 * Volunteer page, laid out the way the reference site lays out theirs: a
 * colour-block hero that asks for one thing, the argument for why it matters,
 * what the work actually is, the two ways to give time set side by side, and
 * the form at the end rather than the front. The old page opened on the form,
 * which asked people to commit before it had told them what they were
 * committing to.
 *
 * Every role below sits inside one of the four areas the application form
 * already offers — mentorship, STEM tutoring, event organization, community
 * outreach — split by whether it is done in person or from anywhere. Nothing
 * here states hours, minimum commitments, or eligibility, because the
 * foundation has not set those in writing.
 */

const IN_PERSON = [
  'Teaching assistant at Youth STEM School sessions',
  'Event support for science fairs, workshops, and showcases',
  'Community outreach visits to schools',
  'Mentoring students face to face',
  'Photography and documentation',
];

const REMOTE = [
  'One-to-one mentorship by phone or video',
  'Online STEM tutoring',
  'Reviewing and giving feedback on student project work',
  'University and careers guidance',
  'Helping plan events and outreach from a distance',
];

const STEPS = [
  {
    title: 'You send the form',
    text: 'Your name, how to reach you, and the area you want to work in. It takes a couple of minutes.',
  },
  {
    title: 'We get in touch',
    text: 'The team replies to talk through what you would like to do and what the programmes need.',
  },
  {
    title: 'You are matched to a programme',
    text: 'Mentorship, tutoring, events, or outreach — in Uganda, in South Sudan, or remotely from wherever you are.',
  },
];

export default function VolunteersContent({
  blocks,
  recognised = [],
}: {
  blocks: Record<string, string>;
  recognised?: SiteTeamMember[];
}) {
  return (
    <main>
      {/* Hero — one colour block, one heading, one ask. */}
      <section className="page-hero surface-brand">
        <div className="page-hero__inner text-center">
          <p className="page-hero__eyebrow">{text(blocks, "p.get-involved", "Get Involved")}</p>
          <h1 className="mx-auto mt-3 max-w-[18ch]">{text(blocks, "h1.volunteer-with-us", "Volunteer with us")}</h1>
          <p className="page-hero__lede mx-auto">{text(blocks, "p.help-us-put-stem-within", "Help us put STEM within reach of students who would not otherwise get near it. Share a few hours, a skill, or a career’s worth of experience.")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#apply" className="btn-on-brand">
              <Icon name="user-plus" />
              Sign up to volunteer
            </Link>
            <Link href="#roles" className="btn-outline-on-brand">
              See the roles
            </Link>
          </div>
        </div>
      </section>

      <div className="pattern-band" aria-hidden="true" />

      {/* Why we need you */}
      <section className="section-tight bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.why-we-need-you", "Why we need you")}</p>
              <h2 className="mt-3">{text(blocks, "h2.talent-is-everywhere-opportunity-is", "Talent is everywhere. Opportunity is not.")}</h2>
            </div>
            <p className="mt-6 text-lg leading-8 text-charcoal-600">{text(blocks, "p.across-uganda-and-south-sudan", "Across Uganda and South Sudan, students with real ability in science, technology, engineering, and mathematics are held back by things that have nothing to do with ability: the cost of education, no laboratory to work in, no one to ask, and no professional network to show them what the work leads to.")}</p>
            <p className="mt-5 text-lg leading-8 text-charcoal-600">{text(blocks, "p.volunteers-are-how-that-last", "Volunteers are how that last gap closes. An engineer who explains what the job is actually like, a teacher who keeps a workshop moving, a graduate who answers a question about university applications — none of it requires a budget, and all of it changes what a student believes is available to them.")}</p>
          </div>
        </div>
      </section>

      {/* What it means to volunteer */}
      <section className="section-tight bg-cream-100">
        <div className="container-page">
          <div className="split">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                The work
              </p>
              <h2 className="mt-3">{text(blocks, "h2.what-it-means-to-volunteer", "What it means to volunteer")}</h2>
              <p className="mt-5 text-lg leading-8 text-charcoal-600">{text(blocks, "p.it-is-not-a-lecture", "It is not a lecture series. Volunteering with the foundation runs from mentoring one student through their next decision, to standing at the back of a science fair making sure twenty projects get set up on time.")}</p>
              <p className="mt-4 text-base leading-7 text-charcoal-600">{text(blocks, "p.you-do-not-have-to", "You do not have to be an engineer. Teachers, university students, organisers, writers, and photographers all have a place here — and so does anyone willing to take a student’s question seriously.")}</p>
              <Link href="#apply" className="btn-primary mt-8">
                <Icon name="user-plus" />
                Sign up now
              </Link>
            </div>

            <figure className="overflow-hidden rounded-2xl">
              <img
                src="/images/teachers.jpeg"
                alt="Teachers taking part in a foundation training session"
                className="aspect-[4/3] w-full object-cover"
                width={1200}
                height={900}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Volunteer roles */}
      <section id="roles" className="section-tight bg-white">
        <div className="container-page">
          <div className="section-head">
            <h2>{text(blocks, "h2.volunteer-roles", "Volunteer roles")}</h2>
            <p className="mt-4 text-lg leading-8 text-charcoal-600">{text(blocks, "p.two-ways-to-give-time", "Two ways to give time. Choose the one that fits where you are and how much of it you have.")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                image: '/images/catapilar.jpeg',
                alt: 'Students presenting electronics and solar experiments at a STEM exhibition',
                kicker: 'In person',
                cta: 'Sign up for in-person roles',
                title: 'Uganda and South Sudan',
                blurb:
                  'On the ground with students, at the sessions, fairs, and school visits the programmes run.',
                roles: IN_PERSON,
              },
              {
                image: '/images/robot.jpeg',
                alt: 'Secondary school research and robotics',
                kicker: 'Remote',
                cta: 'Sign up for remote roles',
                title: 'From anywhere',
                blurb:
                  'By phone, video, or email — most of the mentoring and review work does not need you in the room.',
                roles: REMOTE,
              },
            ].map((card) => (
              <article key={card.kicker} className="card">
                <div className="card-media">
                  <img
                    src={card.image}
                    alt={card.alt}
                    width={1200}
                    height={750}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="card-body">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-700">
                    {card.kicker}
                  </p>
                  <h3 className="text-2xl">{card.title}</h3>
                  <p className="text-charcoal-600">{card.blurb}</p>

                  <ul className="mt-4 space-y-3">
                    {card.roles.map((role) => (
                      <li key={role} className="flex items-start gap-3">
                        <Icon
                          name="check-circle"
                          className="mt-0.5 h-5 w-5 shrink-0 text-orange-700"
                        />
                        <span className="text-charcoal-700">{role}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="#apply" className="btn-ghost mt-auto self-start pt-6">
                    {card.cta}
                    <Icon name="arrow-right" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-charcoal-500">{text(blocks, "p.not-sure-which-fits-pick", "Not sure which fits? Pick the area that interests you on the form and the team will work the rest out with you.")}</p>
        </div>
      </section>

      {/* People who have already done it. Rendered only when somebody has been
          named — an empty "our outstanding volunteers" heading would say the
          opposite of what it is for. */}
      {recognised.length > 0 ? (
        <section className="section-tight bg-cream-100">
          <div className="container-page">
            <div className="section-head">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                Recognition
              </p>
              <h2 className="mt-3">
                {text(blocks, 'recognition.heading', 'Volunteers who went further')}
              </h2>
              <p className="mt-4 text-lg leading-8 text-charcoal-600">
                {text(
                  blocks,
                  'recognition.lede',
                  'The programmes run on the time these people gave. Named here because the work deserves it.',
                )}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recognised.map((person) => (
                <article key={person.name} className="card">
                  {person.img ? (
                    <div className="card-media">
                      <img
                        src={person.img}
                        alt={person.alt || person.name}
                        style={person.focus ? { objectPosition: person.focus } : undefined}
                        className="aspect-[4/3] w-full object-cover"
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <div className="card-body">
                    <h3 className="text-xl">{person.name}</h3>
                    {person.role ? (
                      <p className="mt-1 text-sm font-bold text-orange-700">{person.role}</p>
                    ) : null}
                    {person.bio ? (
                      <p className="mt-3 text-charcoal-600">{person.bio}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Ready to make an impact */}
      <section className="surface-brand section-tight">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-[20ch]">{text(blocks, "h2.ready-to-make-an-impact", "Ready to make an impact?")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8">{text(blocks, "p.one-form-a-couple-of", "One form, a couple of minutes. Everything after that is a conversation.")}</p>
          <Link href="#apply" className="btn-on-brand mt-8">
            <Icon name="user-plus" />
            Sign up to volunteer
          </Link>
        </div>
      </section>

      {/* What happens after you apply */}
      <section className="section-tight bg-white">
        <div className="container-page">
          <div className="section-head">
            <h2>{text(blocks, "h2.what-happens-after-you-apply", "What happens after you apply")}</h2>
          </div>
          <ol className="stage-list">
            {STEPS.map((step, i) => (
              <li key={step.title} className="stage-item">
                <span className="stage-number" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <p className="stage-title">{step.title}</p>
                  <p className="stage-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Application */}
      <section id="apply" className="section-tight bg-cream-100">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <div className="section-head">
              <h2>{text(blocks, "h2.sign-up-to-volunteer", "Sign up to volunteer")}</h2>
              <p className="mt-4 text-lg leading-8 text-charcoal-600">{text(blocks, "p.tell-us-who-you-are", "Tell us who you are and where you would like to help. Fields marked * are required.")}</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card sm:p-9">
              <VolunteerForm />
            </div>
          </div>
        </div>
      </section>

      {/* Other ways in */}
      <section className="section-tight bg-white">
        <div className="container-page">
          <div className="section-head">
            <h2>{text(blocks, "h2.another-way-to-help", "Another way to help")}</h2>
            <p className="mt-4 text-lg leading-8 text-charcoal-600">{text(blocks, "p.time-is-not-the-only", "Time is not the only thing the programmes run on.")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <article className="card">
              <div className="card-body">
                <FeatureIcon name="work" className="feature-ico" />
                <h3 className="mt-4 text-2xl">{text(blocks, "h3.partner-with-us", "Partner with us")}</h3>
                <p className="text-charcoal-600">{text(blocks, "p.schools-universities-and-companies-work", "Schools, universities, and companies work with the foundation on sessions, facilities, and placements. If your organisation could open a door, we would like to hear from you.")}</p>
                <Link href="/contact" className="btn-ghost mt-auto self-start pt-6">
                  Start a conversation
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>

            <article className="card">
              <div className="card-body">
                <FeatureIcon name="service" className="feature-ico" />
                <h3 className="mt-4 text-2xl">{text(blocks, "h3.support-a-student", "Support a student")}</h3>
                <p className="text-charcoal-600">{text(blocks, "p.scholarships-materials-and-travel-to", "Scholarships, materials, and travel to competitions are all funded. A donation pays for the part of a student’s path that goodwill cannot.")}</p>
                <Link href="/donate" className="btn-ghost mt-auto self-start pt-6">
                  Make a donation
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
