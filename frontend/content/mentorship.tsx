import Link from 'next/link';
import { text } from '@/lib/site-content';
import HomeIcon from '@/components/HomeIcon';
import Icon from '@/components/Icon';

/**
 * Mentorship programme page.
 *
 * Built from what the foundation has actually put in writing: the two 2026/27
 * handbooks in public/mentorship, the mentorship strand already described on
 * the home page and the volunteer form, and the mentor published on /team.
 *
 * The handbooks are presented as complete and downloadable. It deliberately
 * states no meeting frequency, cycle length, matching process, vetting policy,
 * or number of pairs, because none of that is written down anywhere yet.
 */

const HANDBOOKS = [
  {
    audience: 'For mentors',
    title: 'Mentor Handbook',
    subtitle: 'Mentor Handbook for Volunteer Mentors',
    cover: '/mentorship/mentor-handbook-cover.webp',
    coverAlt: 'Cover of the Jdiobe STEM Foundation Mentor Handbook 2026/27',
    href: '/mentorship/Mentor%20Handbook.pdf',
    filename: 'jdiobe-mentor-handbook-2026-27.pdf',
  },
  {
    audience: 'For students',
    title: 'Mentee Handbook',
    subtitle: 'Mentee Handbook for Member Students',
    cover: '/mentorship/mentee-handbook-cover.webp',
    coverAlt: 'Cover of the Jdiobe STEM Foundation Mentee Handbook 2026/27',
    href: '/mentorship/Mentee%20Handbook.pdf',
    filename: 'jdiobe-mentee-handbook-2026-27.pdf',
  },
];

export default function MentorshipContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <main>
      <header className="page-hero">
        <div className="page-hero__inner">
          <p className="page-hero__eyebrow">Initiatives</p>
          <h1 className="mt-3 max-w-[18ch]">{text(blocks, "h1.nobody-gets-there-on-their", "Nobody gets there on their own.")}</h1>
          <p className="page-hero__lede">{text(blocks, "p.mentorship-pairs-students-with-the", "Mentorship pairs students with the educators and professionals who have already walked the path they are trying to find — so the next decision is made with someone, not alone.")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/volunteers#apply" className="btn-primary">
              <Icon name="user-plus" />
              Become a mentor
            </Link>
            <Link href="#handbooks" className="btn-ghost">
              The handbooks
            </Link>
          </div>
        </div>
      </header>

      {/* Why it matters */}
      <section className="section-tight bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.why-it-matters", "Why it matters")}</p>
              <h2 className="mt-3">{text(blocks, "h2.the-gap-is-rarely-ability", "The gap is rarely ability.")}</h2>
            </div>
            <p className="mt-6 text-lg leading-8 text-charcoal-600">{text(blocks, "p.a-student-in-uganda-or", "A student in Uganda or South Sudan can be the strongest mathematician in their class and still have no idea what an engineer does all day, which subjects a degree needs, or whether anyone like them has done it before. That is not a gap in talent. It is a gap in exposure and in networks — and it is the one a mentor closes.")}</p>
            <p className="mt-5 text-lg leading-8 text-charcoal-600">{text(blocks, "p.mentorship-runs-alongside-the-other", "Mentorship runs alongside the other programmes rather than instead of them. A scholarship pays the fees; a mentor is the person a student can ask what to do next.")}</p>
          </div>
        </div>
      </section>

      {/* Two sides */}
      <section className="section-tight bg-cream-100">
        <div className="container-page">
          <div className="section-head">
            <h2>{text(blocks, "h2.two-sides-of-the-same", "Two sides of the same pairing")}</h2>
            <p className="mt-4 text-lg leading-8 text-charcoal-600">{text(blocks, "p.the-programme-is-written-down", "The programme is written down twice — once for the person giving time, once for the student receiving it.")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <article className="card">
              <div className="card-body">
                <HomeIcon name="mentorship" className="h-14 w-auto" />
                <h3 className="mt-4 text-2xl">{text(blocks, "h3.what-a-mentor-does", "What a mentor does")}</h3>
                <p className="text-charcoal-600">{text(blocks, "p.volunteer-mentors-are-educators-engineers", "Volunteer mentors are educators, engineers, scientists, and graduates who give time to a student. The work is conversation more than instruction: what the job is actually like, which subjects matter, how an application is put together, and what to do when a plan does not survive contact with reality.")}</p>
                <p className="mt-3 text-charcoal-600">{text(blocks, "p.you-do-not-have-to", "You do not have to be in the room. Mentoring happens face to face where the programmes run, and by phone or video from anywhere else.")}</p>
                <Link href="/volunteers#apply" className="btn-ghost mt-auto self-start pt-6">
                  Sign up to mentor
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>

            <article className="card">
              <div className="card-body">
                <HomeIcon name="access" className="h-14 w-auto" />
                <h3 className="mt-4 text-2xl">{text(blocks, "h3.what-a-student-gets", "What a student gets")}</h3>
                <p className="text-charcoal-600">{text(blocks, "p.member-students-are-matched-with", "Member students are matched with someone working in the field they are curious about. Over a cohort, that becomes guidance on subject choices, university applications, and career direction — plus the thing no syllabus provides: a working adult who takes the question seriously.")}</p>
                <p className="mt-3 text-charcoal-600">{text(blocks, "p.mentorship-is-open-to-students", "Mentorship is open to students already in a foundation programme — the Youth STEM School, the Science Fair, or a scholarship.")}</p>
                <Link href="/programs" className="btn-ghost mt-auto self-start pt-6">
                  See the programmes
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Handbooks */}
      <section id="handbooks" className="section-tight bg-white">
        <div className="container-page">
          <div className="panel-dark">
            <div className="text-center">
              <p className="eyebrow">2026/27</p>
              <h2 className="mt-3">{text(blocks, "h2.the-mentorship-handbooks", "The mentorship handbooks")}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">{text(blocks, "p.both-sides-of-the-pairing", "Both sides of the pairing get a handbook for the year. They are dated 10 September 2026 and prepared by Joshua Mutesasira in Kampala.")}</p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-8 sm:grid-cols-2">
              {HANDBOOKS.map((book) => (
                <div key={book.title} className="text-center">
                  <div className="handbook-cover">
                    <img
                      src={book.cover}
                      alt={book.coverAlt}
                      width={963}
                      height={1350}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-orange-300">
                    {book.audience}
                  </p>
                  <h3 className="mt-1 text-xl">{book.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{book.subtitle}</p>
                  <a
                    href={book.href}
                    download={book.filename}
                    className="btn-on-brand mt-5"
                    target="_blank"
                    rel="noopener"
                  >
                    <Icon name="download" />
                    Download the handbook
                  </a>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-6 text-white/70">
              Free to download and free to pass on — print a set for a school, or send one to a
              student who needs it. Questions about the programme?{' '}
              <Link href="/contact" className="font-semibold text-white underline">
                Get in touch
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Become a mentor */}
      <section className="surface-brand section-tight">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-[22ch]">{text(blocks, "h2.could-you-be-the-person", "Could you be the person a student asks?")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8">
            Pick <strong>Mentorship</strong> as your area on the volunteer form. The team will be in
            touch to work out what fits.
          </p>
          <Link href="/volunteers#apply" className="btn-on-brand mt-8">
            <Icon name="user-plus" />
            Become a mentor
          </Link>
        </div>
      </section>

      {/* A mentor */}
      <section className="section-tight bg-white">
        <div className="container-page">
          <div className="split">
            <figure className="overflow-hidden rounded-2xl">
              <img
                src="/images/mentors/rose-auma.jpg"
                alt="Rose Auma, Senior Civil Engineer and mentor at Jdiobe STEM Foundation"
                className="aspect-[4/5] w-full object-cover"
                style={{ objectPosition: 'center 20%' }}
                width={1000}
                height={1250}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                A mentor
              </p>
              <h2 className="mt-3">Rose Auma</h2>
              <p className="mt-2 text-lg font-bold text-orange-700">{text(blocks, "p.senior-civil-engineer", "Senior Civil Engineer")}</p>
              <p className="mt-5 text-lg leading-8 text-charcoal-600">{text(blocks, "p.a-senior-civil-engineer-specialising", "A Senior Civil Engineer specialising in dam safety and structural engineering. Rose brings professional practice and academic training together to help students see a concrete path from classroom STEM into engineering careers.")}</p>
              <Link href="/team" className="btn-ghost mt-8">
                Meet the team
                <Icon name="arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Where it runs */}
      <section className="section-tight bg-cream-100">
        <div className="container-page">
          <div className="section-head">
            <h2>{text(blocks, "h2.where-it-runs", "Where it runs")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <article className="card">
              <div className="card-body">
                <h3 className="text-2xl">Uganda</h3>
                <p className="text-charcoal-600">{text(blocks, "p.scholarships-hands-on-stem-and", "Scholarships, hands-on STEM, and student-led innovation — mentorship runs alongside all three.")}</p>
                <Link href="/uganda" className="btn-ghost mt-auto self-start pt-6">
                  Our work in Uganda
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>

            <article className="card">
              <div className="card-body">
                <h3 className="text-2xl">South Sudan</h3>
                <p className="text-charcoal-600">{text(blocks, "p.teacher-training-equipment-access-and", "Teacher training, equipment access, and mentorship, as the programmes extend across the border.")}</p>
                <Link href="/south-sudan" className="btn-ghost mt-auto self-start pt-6">
                  Our work in South Sudan
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
