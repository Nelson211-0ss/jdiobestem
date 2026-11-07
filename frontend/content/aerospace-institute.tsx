import { text } from '@/lib/blocks';
import {
  Definitions, ItemGrid, OtherProgrammes, ProgramCta, ProgramHero, ProgramSection, Steps,
} from '@/components/program/Program';

/*
 * The Aerospace Institute.
 *
 * Not open, and the page says so first. The plan (four strands of study,
 * three facilities, four build stages) is the Foundation's published plan,
 * carried over unchanged. No opening date until the site and funding are
 * secured.
 */
export default function AerospaceInstituteContent({ blocks }: { blocks: Record<string, string> }) {
  const t = (key: string, fallback: string) => text(blocks, key, fallback);

  return (
    <main className="prog-page">
      <ProgramHero
        title={t('hero.title', 'Aerospace Institute')}
        lede={t('hero.lede', 'Our next major build: a home for aerospace education, research and industry partnership. It has not opened yet. Designing the programme and signing partners is the work in front of us now.')}
        actions={[
          { href: '/contact', label: t('hero.action', 'Partner with us') },
          { href: '/donate', label: t('hero.action2', 'Support the build') },
        ]}
        image="/images/green-festival/web/IMG_8908.jpg"
        imageAlt="Model aircraft on an exhibition table"
        caption={t('hero.caption', 'Model aircraft on the Foundation’s table at Green Fest, July 2026.')}
        facts={[
          { term: t('facts.status.term', 'Status'), detail: t('facts.status', 'Planned, not yet open') },
          { term: t('facts.now.term', 'Under way now'), detail: t('facts.now', 'Curriculum and partnerships') },
          { term: t('facts.next.term', 'Next'), detail: t('facts.next', 'Securing the site and funding') },
          { term: t('facts.apply.term', 'Applications'), detail: t('facts.apply', 'Not open yet') },
        ]}
      />

      <ProgramSection id="why" title={t('why.title', 'Why aerospace')}>
        <div className="prog-prose">
          <p className="prog-lead">{t('why.p1', 'When it opens, the institute will run focused pathways for students who want to work in aviation and space technology: rigorous fundamentals, hands-on build-and-test cycles, and the professional habits that carry into university and work.')}</p>
          <p>{t('why.p3', 'The Foundation is led by an aerospace engineer. Muwanika Jdiobe, PhD, went from a science fair at Holy Cross Lake View in Jinja to aerospace and mechanical engineering at Oklahoma State University; the institute is meant to make that route less of an exception.')}</p>
          <p>{t('why.p2', 'We are publishing the plan early on purpose. The schools, universities and industry partners who join now are the ones who will shape what gets built.')}</p>
        </div>
      </ProgramSection>

      <ProgramSection
        id="study"
        title={t('study.title', 'What students will study')}
        intro={<p>{t('study.intro', 'Four strands, taught together rather than one after another. A student should be flying, measuring and arguing about a design in the same term.')}</p>}
      >
        <ItemGrid
          items={[
            { title: t('study.1.title', 'Flight science'), body: t('study.1', 'Aerodynamics, propulsion, stability and mission design: the physics a vehicle has to obey before anyone builds one.') },
            { title: t('study.2.title', 'Safety and systems'), body: t('study.2', 'Systems thinking, testing discipline and operations. How aircraft are certified, maintained and flown without incident.') },
            { title: t('study.3.title', 'Design and fabrication'), body: t('study.3', 'Drawing, machining and assembling real parts, learning materials and structures at the bench.') },
            { title: t('study.4.title', 'Data and control'), body: t('study.4', 'Instrumentation, avionics and flight data: reading what a test told you, and changing the design because of it.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="build"
        title={t('build.title', 'What we intend to build')}
        intro={<p>{t('build.intro', 'Three things the region does not have in one place.')}</p>}
      >
        <Definitions
          items={[
            { term: t('build.1.term', 'Engineering studios'), detail: t('build.1', 'Design, fabrication and integration space where a cohort can take a vehicle from sketch to flight test without leaving the building.') },
            { term: t('build.2.term', 'A research lab'), detail: t('build.2', 'Mentored research in unmanned systems, materials and instrumentation, carried from a question through validation to a paper students can defend.') },
            { term: t('build.3.term', 'A partner network'), detail: t('build.3', 'Standing links with universities, aviation firms and alumni, so internships, guest teaching and equipment are part of the institute rather than favours.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="stages"
        title={t('stages.title', 'How it gets built')}
        intro={<p>{t('stages.intro', 'Four stages, in order. We will publish an opening date once the site and the funding are both secured, not before.')}</p>}
      >
        <Steps
          items={[
            { title: t('stages.1.title', 'Curriculum and partnerships (under way)'), body: t('stages.1', 'Designing the pathways with practising engineers, and signing the university and industry partners who will teach, examine and hire from them.') },
            { title: t('stages.2.title', 'Site and funding (next)'), body: t('stages.2', 'Securing the land, the workshop and lab build, and the capital behind it. This is where donors and sponsors make the most difference.') },
            { title: t('stages.3.title', 'Pilot cohort'), body: t('stages.3', 'A small first intake taught in partner facilities, so the teaching is tested on real students before the institute opens.') },
            { title: t('stages.4.title', 'The institute opens'), body: t('stages.4', 'Full intake, the research programme running, and placements with the partners signed in the first stage.') },
          ]}
        />
      </ProgramSection>

      <ProgramCta
        title={t('cta.title', 'Help us build it')}
        body={t('cta.body', 'There is nothing to apply to yet, but there is plenty to join. Schools and universities can shape the curriculum, companies can offer equipment, teaching or placements, and donors can move the site forward.')}
        actions={[
          { href: '/contact', label: t('cta.action', 'Talk to us about partnering') },
          { href: '/donate', label: t('cta.action2', 'Support the build') },
        ]}
      />
      <OtherProgrammes current="/aerospace-institute" />
    </main>
  );
}
