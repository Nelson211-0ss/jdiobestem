import { text } from '@/lib/blocks';
import {
  Definitions, Figure, ItemGrid, OtherProgrammes, ProgramCta, ProgramHero, ProgramSection, Steps,
} from '@/components/program/Program';

/*
 * Youth STEM: the hands-on workshops.
 *
 * Sources: STEM Bridge 2026, chiefly the Programs Coordinator's piece ("I know
 * these rooms") and the Country Director profile, which describe how the
 * workshops run, what students build, and what limits their reach. The old
 * page's counters and unattributed quotes are gone; real numbers and named
 * voices can return when they exist.
 */
export default function YouthStemContent({ blocks }: { blocks: Record<string, string> }) {
  const t = (key: string, fallback: string) => text(blocks, key, fallback);

  return (
    <main className="prog-page">
      <ProgramHero
        title={t('hero.title', 'Youth STEM')}
        lede={t('hero.lede', 'Hands-on workshops where students learn science and engineering by building something they can hold and explain: a robot, an app, a working model.')}
        actions={[
          { href: '/contact', label: t('hero.action', 'Bring workshops to your school') },
          { href: '/volunteers', label: t('hero.action2', 'Volunteer') },
        ]}
        image="/images/catapilar.jpeg"
        imageAlt="Students with the model vehicles and crane they built from card and wood"
        facts={[
          { term: t('facts.where.term', 'Where'), detail: t('facts.where', 'Holy Cross Lake View S.S.S, Jinja, and partner schools in Uganda') },
          { term: t('facts.format.term', 'Format'), detail: t('facts.format', 'Workshops in cohorts, scheduled around the school term') },
          { term: t('facts.who.term', 'Run by'), detail: t('facts.who', 'Our Programs Coordinator and volunteer mentors') },
          { term: t('facts.ends.term', 'Every project ends in'), detail: t('facts.ends', 'Something a student can hold and explain') },
        ]}
      />

      <ProgramSection
        id="how"
        title={t('how.title', 'How the workshops run')}
        intro={<p>{t('how.intro', 'The workshops have to be ambitious enough to be worth a student’s Saturday, and modest enough to run with the equipment we have, in borrowed rooms, with mentors who have day jobs.')}</p>}
      >
        <Definitions
          items={[
            { term: t('how.1.term', 'Equipment that lasts'), detail: t('how.1', 'We choose equipment that can be repaired locally over equipment that photographs well. Kit that cannot be fixed in the district ends up in a cupboard.') },
            { term: t('how.2.term', 'Projects with an end'), detail: t('how.2', 'Every project ends in something a student can hold and explain to someone else.') },
            { term: t('how.3.term', 'Cohorts, not one-offs'), detail: t('how.3', 'Students join a cohort that runs across a term, so the work builds week on week. A programme that opens for a term and then closes teaches a lesson nobody intended.') },
            { term: t('how.4.term', 'Behind the scenes'), detail: t('how.4', 'Matching cohorts to terms, briefing mentors, tracking attendance, and making sure the equipment for week seven is in the room in week seven.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="built"
        title={t('built.title', 'What students have built')}
        intro={<p>{t('built.intro', 'A few of the projects that have come out of the workshops.')}</p>}
      >
        <ItemGrid
          items={[
            { title: t('built.1.title', 'A translator application'), body: t('built.1', 'Software designed and tested by students.') },
            { title: t('built.2.title', 'An assistive walking stick'), body: t('built.2', 'A walking aid designed and built by students.') },
            { title: t('built.3.title', 'Team-built robots'), body: t('built.3', 'Robots designed, assembled and programmed by a team.') },
            { title: t('built.4.title', 'Drones'), body: t('built.4', 'A drone project by students at Holy Cross Lake View S.S.S, photographed in July 2022.') },
          ]}
        />
        <div className="prog-figures">
          <Figure src="/images/1718038140753.jpeg" alt="A student wiring sensors onto a wooden frame" />
          <Figure src="/images/hero-diy-stem-car.webp" alt="A model vehicle built from recycled materials, wheels and a small motor" />
        </div>
      </ProgramSection>

      <ProgramSection
        id="next"
        title={t('next.title', 'Where it leads')}
        intro={<p>{t('next.intro', 'Seven of the students featured in STEM Bridge 2026 already assist at the workshop that taught them.')}</p>}
      >
        <Steps
          items={[
            { title: t('next.1.title', 'Workshops'), body: t('next.1', 'Students build, test and explain their first projects.') },
            { title: t('next.2.title', 'The Science Fair'), body: t('next.2', 'Secondary students take a project further: a written proposal, six months of work, and judges.') },
            { title: t('next.3.title', 'A mentor'), body: t('next.3', 'A working engineer, scientist or educator to ask about subjects, applications and careers.') },
            { title: t('next.4.title', 'A scholarship'), body: t('next.4', 'When fees, materials or a fare are what stand in the way of the next step.') },
          ]}
        />
      </ProgramSection>

      <ProgramCta
        title={t('cta.title', 'More students are waiting than we can reach')}
        body={t('cta.body', 'Our reach is limited by the number of coordinators we can support, not by the number of students who want to take part. Schools that want to host a workshop, and volunteers who can give a few Saturdays, help us take on the next cohort.')}
        actions={[
          { href: '/contact', label: t('cta.action', 'Bring workshops to your school') },
          { href: '/volunteers', label: t('cta.action2', 'Volunteer') },
        ]}
      />
      <OtherProgrammes current="/youth-stem" />
    </main>
  );
}
