import { text } from '@/lib/blocks';
import {
  Definitions, Figure, OtherProgrammes, ProgramCta, ProgramHero, ProgramSection,
} from '@/components/program/Program';

/*
 * Community Outreach.
 *
 * Sources: STEM Bridge 2026, chiefly "Stewards of the Future" (the Laudato
 * Si Green Festival, July 2026) and the Programs Coordinator's account of
 * outreach with schools and community partners. Photographs are from the
 * festival. The old page's counters, sample schedule and unattributed
 * quotes are gone.
 */
export default function CommunityOutreachContent({ blocks }: { blocks: Record<string, string> }) {
  const t = (key: string, fallback: string) => text(blocks, key, fallback);

  return (
    <main className="prog-page">
      <ProgramHero
        title={t('hero.title', 'Community Outreach')}
        lede={t('hero.lede', 'Outreach takes students’ work out of the workshop and puts it in front of other schools, families and the public, with the students who built it there to explain it.')}
        actions={[
          { href: '/contact', label: t('hero.action', 'Invite us to your event') },
          { href: '#green-fest', label: t('hero.action2', 'See Green Fest 2026') },
        ]}
        image="/images/green-festival/web/IMG_9209.jpg"
        imageAlt="Visiting primary pupils holding a certificate at the Laudato Si Green Festival"
        caption={t('hero.caption', 'Visiting primary pupils at the Laudato Si Green Festival, Holy Cross Lake View S.S.S, July 2026.')}
        facts={[
          { term: t('facts.with.term', 'Who we work with'), detail: t('facts.with', 'Schools and community partners') },
          { term: t('facts.who.term', 'Who presents'), detail: t('facts.who', 'Students, explaining their own work') },
          { term: t('facts.recent.term', 'Most recent'), detail: t('facts.recent', 'Laudato Si Green Festival, July 2026') },
          { term: t('facts.base.term', 'Based at'), detail: t('facts.base', 'Holy Cross Lake View S.S.S, Wanyange, Jinja') },
        ]}
      />

      <ProgramSection id="why" title={t('why.title', 'Shown here, built elsewhere')}>
        <div className="prog-prose">
          <p className="prog-lead">{t('why.p1', 'A stand at a festival reaches a student once. A programme at the school they already attend reaches them every term. So outreach is where the work gets shown, not where it happens.')}</p>
          <p>{t('why.p2', 'That is why our stands are run by students rather than staff. Visitors talk to the people who built the things on the table, with mentors behind them for the harder questions. Younger pupils get to watch students only a few years older explain a piece of engineering they made themselves.')}</p>
        </div>
      </ProgramSection>

      <ProgramSection
        id="green-fest"
        title={t('gf.title', 'Green Fest 2026')}
        intro={<p>{t('gf.intro', 'In July, the Foundation joined the third Laudato Si Green Festival at Holy Cross Lake View S.S.S: two days of climate action organised by the Laudato Youth movement through its school clubs.')}</p>}
      >
        <div className="prog-prose">
          <p>{t('gf.p1', 'Students from a spread of schools exhibited under marquees along the school field: the Laudato Youth delegates, visiting primary pupils, and the host school’s own students. The Foundation’s table sat among the student displays rather than in a sponsors’ row, and for most of the day it was staffed by students explaining their own work.')}</p>
          <p>{t('gf.p2', 'The exhibits ranged from a solar array wired to storage and a multi-stage water-treatment rig to a set of model aircraft that drew a standing crowd of adults, with a queue of younger pupils waiting behind them. The festival closed with certificates.')}</p>
        </div>
        <div className="prog-figures">
          <Figure src="/images/green-festival/web/IMG_8908.jpg" alt="Model aircraft and a rocket model laid out on an exhibition table" caption={t('gf.c1', 'Model aircraft on the exhibition tables.')} />
          <Figure src="/images/green-festival/web/IMG_9044.jpg" alt="Visitors looking at model aircraft at the Foundation’s table" caption={t('gf.c2', 'Visitors at the model aircraft.')} />
        </div>
      </ProgramSection>

      <ProgramSection
        id="invite"
        title={t('invite.title', 'Invite us')}
        intro={<p>{t('invite.intro', 'We join events where students can show and explain what they have built.')}</p>}
      >
        <Definitions
          items={[
            { term: t('invite.who.term', 'Who can invite us'), detail: t('invite.who', 'Schools, community organisations, and the organisers of festivals and public events.') },
            { term: t('invite.what.term', 'What we bring'), detail: t('invite.what', 'A table of student projects, run by the students who built them, with mentors on hand.') },
            { term: t('invite.how.term', 'How to ask'), detail: t('invite.how', 'Get in touch with the date, the place and who will be there. We will tell you what we can bring.') },
          ]}
        />
      </ProgramSection>

      <ProgramCta
        title={t('cta.title', 'Bring students’ work to your community')}
        body={t('cta.body', 'Every kilometre travelled and every piece of equipment on our table was paid for by someone who decided a student they will never meet deserved the chance.')}
        actions={[
          { href: '/contact', label: t('cta.action', 'Invite us to your event') },
          { href: '/donate', label: t('cta.action2', 'Support the work') },
        ]}
      />
      <OtherProgrammes current="/community-outreach" />
    </main>
  );
}
