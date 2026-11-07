import Link from 'next/link';
import { text } from '@/lib/blocks';
import Icon from '@/components/Icon';
import {
  Definitions, OtherProgrammes, ProgramCta, ProgramHero, ProgramSection,
} from '@/components/program/Program';

/*
 * Mentorship.
 *
 * Built from what the Foundation has put in writing: the two 2026/27
 * handbooks, the volunteer form, the mentor published on /team, and the
 * STEM Bridge 2026 profile of that mentor. It states no meeting frequency,
 * cycle length, matching process or number of pairs, because none of that is
 * written down yet.
 */
export default function MentorshipContent({ blocks }: { blocks: Record<string, string> }) {
  const t = (key: string, fallback: string) => text(blocks, key, fallback);

  return (
    <main className="prog-page">
      <ProgramHero
        title={t('hero.title', 'Mentorship')}
        lede={t('hero.lede', 'Mentorship pairs students with educators and professionals who have already walked the path they are trying to find, so the next decision is made with someone, not alone.')}
        actions={[
          { href: '/volunteers', label: t('hero.action', 'Become a mentor') },
          { href: '#handbooks', label: t('hero.action2', 'Read the handbooks') },
        ]}
        image="/images/185A1601-scaled.jpg"
        imageAlt="Students explaining their projects to visitors at an exhibition"
        facts={[
          { term: t('facts.who.term', 'For students in'), detail: t('facts.who', 'Youth STEM, the Science Fair, or a scholarship') },
          { term: t('facts.mentors.term', 'Mentors are'), detail: t('facts.mentors', 'Educators, engineers, scientists and graduates') },
          { term: t('facts.where.term', 'Where'), detail: t('facts.where', 'In person where the programmes run, or by phone and video') },
          { term: t('facts.where2.term', 'Countries'), detail: t('facts.where2', 'Uganda and South Sudan') },
        ]}
      />

      <ProgramSection id="why" title={t('why.title', 'The gap is rarely ability')}>
        <div className="prog-prose">
          <p className="prog-lead">{t('why.p1', 'A student in Uganda or South Sudan can be the strongest mathematician in their class and still have no idea what an engineer does all day, which subjects a degree needs, or whether anyone like them has done it before. That is not a gap in talent. It is a gap in exposure and in networks, and it is the one a mentor closes.')}</p>
          <p>{t('why.p2', 'Mentorship runs alongside the other programmes rather than instead of them. A scholarship pays the fees; a mentor is the person a student can ask what to do next.')}</p>
        </div>
      </ProgramSection>

      <ProgramSection id="how" title={t('how.title', 'Two sides of the same pairing')}>
        <Definitions
          items={[
            { term: t('how.mentor.term', 'What a mentor does'), detail: t('how.mentor', 'Gives time to a student. The work is conversation more than instruction: what the job is actually like, which subjects matter, how an application is put together, and what to do when a plan does not survive contact with reality.') },
            { term: t('how.student.term', 'What a student gets'), detail: t('how.student', 'Someone working in the field they are curious about. Over a cohort, that becomes guidance on subject choices, university applications and career direction, and a working adult who takes the question seriously.') },
            { term: t('how.remote.term', 'You do not have to be in the room'), detail: t('how.remote', 'Mentoring happens face to face where the programmes run, and by phone or video from anywhere else.') },
            { term: t('how.who.term', 'Who can be mentored'), detail: t('how.who', 'Students already in a Foundation programme: Youth STEM, the Science Fair, or a scholarship.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="handbooks"
        title={t('hb.title', 'The handbooks')}
        intro={<p>{t('hb.intro', 'Each side of the pairing has a handbook for the year, dated 10 September 2026.')}</p>}
      >
        <div className="prog-covers">
          <a href="/mentorship/Mentor%20Handbook.pdf" download="jdiobe-mentor-handbook-2026-27.pdf">
            <img src="/mentorship/mentor-handbook-cover.webp" alt="Cover of the Mentor Handbook 2026/27" width="400" height="566" loading="lazy" />
            {t('hb.mentor', 'Mentor Handbook')}
            <span>{t('hb.mentor.d', 'For volunteer mentors · PDF')}</span>
          </a>
          <a href="/mentorship/Mentee%20Handbook.pdf" download="jdiobe-mentee-handbook-2026-27.pdf">
            <img src="/mentorship/mentee-handbook-cover.webp" alt="Cover of the Mentee Handbook 2026/27" width="400" height="566" loading="lazy" />
            {t('hb.mentee', 'Mentee Handbook')}
            <span>{t('hb.mentee.d', 'For students · PDF')}</span>
          </a>
        </div>
      </ProgramSection>

      <ProgramSection id="mentor" title={t('rose.title', 'One of our mentors')}>
        <div className="prog-person">
          <img src="/images/mentors/rose-auma.webp" alt="Rose Auma" width="400" height="500" loading="lazy" />
          <div>
            <h3>{t('rose.name', 'Rose Auma')}</h3>
            <p className="prog-person__role">{t('rose.role', 'Senior Civil Engineer')}</p>
            <p>{t('rose.body', 'Rose specialises in dam safety and structural engineering, a discipline judged against measurements rather than optimism. She brings professional practice and academic training together to show students the line that runs from a classroom in Jinja to an engineering career.')}</p>
            <Link href="/team" className="editorial-link">{t('rose.action', 'Meet the team')} <Icon name="arrow-right" /></Link>
          </div>
        </div>
      </ProgramSection>

      <ProgramCta
        title={t('cta.title', 'Could you be the person a student asks?')}
        body={t('cta.body', 'Choose Mentorship as your area on the volunteer form, and the team will be in touch to work out what fits around your work.')}
        actions={[
          { href: '/volunteers', label: t('cta.action', 'Sign up to mentor') },
          { href: '/contact', label: t('cta.action2', 'Ask a question') },
        ]}
      />
      <OtherProgrammes current="/mentorship" />
    </main>
  );
}
