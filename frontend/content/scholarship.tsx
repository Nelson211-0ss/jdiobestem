import Link from 'next/link';
import { text } from '@/lib/blocks';
import Icon from '@/components/Icon';
import type { SiteStat } from '@/lib/site-content';
import {
  Definitions, Figure, ItemGrid, OtherProgrammes, ProgramCta, ProgramHero, ProgramSection,
} from '@/components/program/Program';

/*
 * Scholarships.
 *
 * Sources: the scholarship-legacy piece written for STEM Bridge 2026 (why the
 * scholarships carry the names they do), the magazine's account of Moses
 * Nambiro's travel award and of how students are identified at Holy Cross
 * Lake View S.S.S, and the open/closed status the site already published.
 * There is no public application form, so the page says how students are
 * actually chosen and where to ask.
 */
export default function ScholarshipContent({ blocks, awarded }: { blocks: Record<string, string>; awarded?: SiteStat }) {
  const t = (key: string, fallback: string) => text(blocks, key, fallback);

  const facts = [
    { term: t('facts.covers.term', 'What a scholarship covers'), detail: t('facts.covers', 'Fees, materials or travel') },
    { term: t('facts.how.term', 'How students are chosen'), detail: t('facts.how', 'Through the schools we work with') },
    { term: t('facts.repay.term', 'Repayment'), detail: t('facts.repay', 'None') },
  ];
  if (awarded) facts.push({ term: awarded.label, detail: `${awarded.value.toLocaleString('en-US')}${awarded.suffix}` });

  return (
    <main className="prog-page">
      <ProgramHero
        title={t('hero.title', 'Scholarships')}
        lede={t('hero.lede', 'A scholarship pays for the one thing standing between a capable student and the next step, whether that is a term’s fees, the materials for a course, or the fare to a university place.')}
        actions={[
          { href: '/donate', label: t('hero.action', 'Sponsor a student') },
          { href: '#the-scholarships', label: t('hero.action2', 'See the scholarships') },
        ]}
        image="/images/scholarship-students.jpg"
        imageAlt="Two students at Holy Cross Lake View S.S.S in front of the school’s Education for Service banner"
        facts={facts}
      />

      <ProgramSection
        id="why-names"
        title={t('names.title', 'Why our scholarships carry names')}
      >
        <div className="prog-prose">
          <p className="prog-lead">{t('names.p1', 'When Muwanika Jdiobe was an undergraduate at Oklahoma State University, there were times when money nearly ended his education. People stepped in: some paid, some made calls, and some made sure an unpaid balance did not become the end of the road. Among them were Dr. Ron Beer and Regina Henry.')}</p>
          <p>{t('names.p2', 'The scholarships named after them carry that help forward to another generation of students. Someone opens a door for you; years later, you hold it open for someone else.')}</p>
        </div>
        <blockquote className="prog-quote">{t('names.quote', '“The greatest way I can thank the people who invested in my education is to make sure their generosity does not end with me.”')}</blockquote>
        <p>{t('names.quote.by', 'Muwanika Jdiobe, PhD, Founder and Executive Director')}</p>
      </ProgramSection>

      <ProgramSection
        id="the-scholarships"
        title={t('list.title', 'The scholarships')}
        intro={<p>{t('list.intro', 'All three can be combined with a mentor from our mentorship programme.')}</p>}
        wide
      >
        <ItemGrid
          columns={3}
          items={[
            {
              tag: t('s1.status', 'Applications closed'),
              title: t('s1.title', 'Dr. Ron and Cara Beer STEM Scholarship'),
              body: t('s1.body', 'Dr. Ron Beer believed in Muwanika when continuing at university was financially difficult. The scholarship in his and Cara Beer’s name supports students pursuing STEM, with mentorship, exposure and leadership development alongside the money.'),
              children: <Link href="/contact" className="editorial-link">{t('s1.action', 'Ask about the next round')} <Icon name="arrow-right" /></Link>,
            },
            {
              tag: t('s2.status', 'Applications open'),
              title: t('s2.title', 'Regina Henry Scholarship'),
              body: t('s2.body', 'Regina Henry helped when Muwanika was finishing his degree in the United States. The scholarship extends the same help to students facing barriers of their own.'),
              children: <Link href="/contact" className="editorial-link">{t('s2.action', 'Ask about applying')} <Icon name="arrow-right" /></Link>,
            },
            {
              tag: t('s3.status', 'Applications open'),
              title: t('s3.title', 'Jdiobe STEM Scholarship'),
              body: t('s3.body', 'The Foundation’s own scholarship, awarded directly to students with high potential. It can cover fees, materials, or travel and research costs.'),
              children: <Link href="/contact" className="editorial-link">{t('s3.action', 'Ask about applying')} <Icon name="arrow-right" /></Link>,
            },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="moses"
        title={t('moses.title', 'One obstacle, removed')}
        intro={<p>{t('moses.intro', 'We do not try to fund whole educations. We look for the single point where a promising student would otherwise stop, and pay for that.')}</p>}
      >
        <div className="prog-person">
          <img src="/images/moses-nambiro.webp" alt="Moses Nambiro" width="400" height="500" loading="lazy" />
          <div>
            <h3>{t('moses.name', 'Moses Nambiro')}</h3>
            <p className="prog-person__role">{t('moses.role', 'Travel scholarship, April 2026')}</p>
            <p>{t('moses.body', 'Moses had a place to study Aeronautical Engineering abroad, and no way to pay the airfare. On 6 April 2026 the Foundation awarded him a $1,000 travel scholarship. It does not pay for his degree. It paid for the one thing that would otherwise have kept him at home.')}</p>
            <Link href="/news/nambiro-scholarship" className="editorial-link">{t('moses.action', 'Read Moses’s story')} <Icon name="arrow-right" /></Link>
          </div>
        </div>
      </ProgramSection>

      <ProgramSection
        id="how-chosen"
        title={t('chosen.title', 'How students are chosen')}
        intro={<p>{t('chosen.intro', 'There is no application form on this website. If you are a student, parent or teacher, contact us and we will tell you about the next round.')}</p>}
      >
        <Definitions
          items={[
            { term: t('chosen.1.term', 'Through the school'), detail: t('chosen.1', 'At Holy Cross Lake View S.S.S in Jinja, where our work in Uganda is based, an on-site coordinator identifies students who would benefit and keeps the records our scholarship committee decides from.') },
            { term: t('chosen.3.term', 'What it can cover'), detail: t('chosen.3', 'Tuition and school fees, course materials, and travel when the place is already won and the fare is the obstacle.') },
            { term: t('chosen.4.term', 'What we ask back'), detail: t('chosen.4', 'Nothing has to be repaid. We hope only that when their chance comes, scholars will open the door for someone else.') },
          ]}
        />
        <Figure src="/images/hero-students-community.webp" alt="Students gathered outside their school, one holding a model airplane" caption={t('chosen.caption', 'Students at Holy Cross Lake View S.S.S, Wanyange, Jinja.')} />
      </ProgramSection>

      <ProgramCta
        title={t('cta.title', 'Fund the next scholarship')}
        body={t('cta.body', 'A gift can cover a term’s fees, a set of materials or a fare. You can also set up a scholarship in someone’s name.')}
        actions={[
          { href: '/donate', label: t('cta.action', 'Sponsor a student') },
          { href: '/contact', label: t('cta.action2', 'Set up a named scholarship') },
        ]}
      />
      <OtherProgrammes current="/scholarship" />
    </main>
  );
}
