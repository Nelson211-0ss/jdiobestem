import { text } from '@/lib/blocks';
import ProposalForm from '@/components/ProposalForm';
import {
  Definitions, Downloads, Faq, Figure, ItemGrid, OtherProgrammes, ProgramCta,
  ProgramHero, ProgramJumps, ProgramSection, Steps,
} from '@/components/program/Program';

/*
 * The Science Fair.
 *
 * Every fact on this page comes from the Student Project Handbook 2026/27
 * (issued 3 September 2026), which settles the questions the earlier
 * Proposal Workbook left as placeholders: team size, project period and the
 * category list. Where the handbook leaves something to each year's
 * competition announcement (dates, projects per school, the exact awards), the
 * page says so rather than guessing.
 */
export default function SecondaryResearchContent({ blocks }: { blocks: Record<string, string> }) {
  const t = (key: string, fallback: string) => text(blocks, key, fallback);

  return (
    <main className="prog-page">
      <ProgramHero
        title={t('hero.title', 'Secondary School Science Fair')}
        lede={t('hero.lede', 'Students choose a real problem, write a proposal, spend up to six months on the project with a teacher mentor, and present what they found to judges at the science fair.')}
        actions={[
          { href: '#register', label: t('hero.action', 'Register your project') },
          { href: '#downloads', label: t('hero.action2', 'Get the handbook') },
        ]}
        image="/images/hero-science-fair-projects.webp"
        imageAlt="Students presenting electronics and solar projects at a science fair"
        facts={[
          { term: t('facts.who.term', 'Who can enter'), detail: t('facts.who', 'Students at a participating school, at any level') },
          { term: t('facts.team.term', 'On your own or in a team'), detail: t('facts.team', 'Teams of up to five') },
          { term: t('facts.period.term', 'Project period'), detail: t('facts.period', 'Six months') },
          { term: t('facts.mentor.term', 'You will need'), detail: t('facts.mentor', 'A teacher mentor and your school’s approval') },
          { term: t('facts.cost.term', 'Entry fee'), detail: t('facts.cost', 'None') },
        ]}
      />

      <ProgramJumps
        label="Science Fair sections"
        links={[
          ['#how-it-works', 'How it works'], ['#who-can-enter', 'Who can enter'], ['#categories', 'Categories'],
          ['#judging', 'Judging and awards'], ['#funding', 'Funding'], ['#downloads', 'Downloads'], ['#register', 'Register'], ['#questions', 'Questions'],
        ]}
      />

      <ProgramSection
        id="how-it-works"
        title={t('how.title', 'How it works')}
        intro={<p>{t('how.intro', 'Work back from the science fair date, not forward from today. Teams that start late run out of time for testing and revision, the two stages judges notice most.')}</p>}
      >
        <Steps
          items={[
            { title: t('how.1.title', 'Find a question'), body: t('how.1', 'Start with a problem at school or in your community, a pattern in some data, or an idea for improving a tool.') },
            { title: t('how.2.title', 'Talk it through with a teacher'), body: t('how.2', 'Agree with a teacher mentor that the project is feasible, safe and can be supervised. Your school must authorise the application.') },
            { title: t('how.3.title', 'Write the proposal'), body: t('how.3', 'Use the Proposal Workbook to set out the problem, your plan, a budget in Ugandan shillings and a timeline, then register the project on this page.') },
            { title: t('how.4.title', 'Review'), body: t('how.4', 'The Foundation checks each proposal for eligibility, quality, safety, ethics and feasibility.') },
            { title: t('how.5.title', 'Do the work'), body: t('how.5', 'Research, experiment, design, code, build or analyse. Keep a project notebook with your data, photographs where allowed, and receipts if the project is funded.') },
            { title: t('how.6.title', 'Prepare'), body: t('how.6', 'Refine your report, poster and prototype, and practise explaining the work in your own words.') },
            { title: t('how.7.title', 'The science fair'), body: t('how.7', 'Selected projects are displayed and judged.') },
            { title: t('how.8.title', 'Afterwards'), body: t('how.8', 'Awards, feedback, mentorship or further support, depending on that year’s competition.') },
          ]}
        />
        <Figure src="/images/1718038140753.jpeg" alt="A student wiring a project built on a wooden frame" />
      </ProgramSection>

      <ProgramSection
        id="who-can-enter"
        title={t('who.title', 'Who can enter')}
        intro={<p>{t('who.intro', 'Each year’s dates, and how many projects a school may enter, are set out in the competition announcement sent to participating schools.')}</p>}
      >
        <Definitions
          items={[
            { term: t('who.student.term', 'Students'), detail: t('who.student', 'Enrolled at a school taking part with the Foundation, at any level. The project must use STEM and be finished within the six-month project period.') },
            { term: t('who.team.term', 'Teams'), detail: t('who.team', 'Up to five students, with one named as the main contact. Everyone must contribute and understand the whole project: judges may ask any member about any part of it.') },
            { term: t('who.mentor.term', 'Teacher mentor'), detail: t('who.mentor', 'Approved by the school. A mentor asks questions, checks safety and helps with facilities. A mentor must not write the proposal, record data or prepare answers for the judges.') },
            { term: t('who.school.term', 'Your school'), detail: t('who.school', 'Must authorise the application, whatever the student’s age, and supervises the work day to day.') },
            { term: t('who.adult.term', 'Students aged 18 or over'), detail: t('who.adult', 'Take part through their school in the same way. Extra safeguarding checks may apply when working with younger participants.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="categories"
        title={t('cat.title', 'Project categories')}
        intro={<p>{t('cat.intro', 'Enter the category that best fits the main question, method or solution. The Foundation may move a project if another category would give it a fairer technical review.')}</p>}
      >
        <ItemGrid
          items={[
            { title: t('cat.1.title', 'Engineering and Design'), body: t('cat.1', 'Structures, machines, transport, water systems, materials and practical engineered solutions.') },
            { title: t('cat.2.title', 'Robotics and Automation'), body: t('cat.2', 'Robots, control systems, sensors, mechatronics and automated processes.') },
            { title: t('cat.3.title', 'Computer Science and Artificial Intelligence'), body: t('cat.3', 'Software, algorithms, apps, machine learning, computer vision and data systems.') },
            { title: t('cat.4.title', 'Physical Sciences'), body: t('cat.4', 'Physics, chemistry, astronomy, materials, energy, electricity, mechanics, waves and heat.') },
            { title: t('cat.5.title', 'Biological and Life Sciences'), body: t('cat.5', 'Plant science, microbiology at approved safe levels, ecology, genetics concepts and physiology.') },
            { title: t('cat.6.title', 'Environmental Science and Climate'), body: t('cat.6', 'Water, air, soil, waste, conservation, climate resilience and pollution monitoring.') },
            { title: t('cat.7.title', 'Agriculture and Food Security'), body: t('cat.7', 'Crops, irrigation, soil, post-harvest systems, food preservation and agricultural technology.') },
            { title: t('cat.8.title', 'Health and Biomedical Innovation'), body: t('cat.8', 'Public health, non-diagnostic health technology, assistive devices and health education.') },
            { title: t('cat.9.title', 'Mathematics and Data Science'), body: t('cat.9', 'Mathematical models, optimisation, probability, statistics and data analysis.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="judging"
        title={t('judge.title', 'Judging and awards')}
        intro={<p>{t('judge.intro', 'The fair rewards the quality of your thinking, not the money spent. A careful low-cost project can beat an expensive one with weak reasoning.')}</p>}
      >
        <div>
          <h3 className="prog-subhead">{t('judge.proposal.title', 'Proposals are marked out of 100')}</h3>
          <table className="prog-table">
            <thead><tr><th scope="col">What reviewers look for</th><th scope="col">What a strong proposal shows</th><th scope="col">Marks</th></tr></thead>
            <tbody>
              <tr><th scope="row">{t('judge.r1', 'A clear problem')}</th><td>{t('judge.r1.d', 'One specific problem in a specific place, with evidence that it is real.')}</td><td>20</td></tr>
              <tr><th scope="row">{t('judge.r2', 'A workable plan')}</th><td>{t('judge.r2.d', 'A plan that fits your skills, time, school and the support available.')}</td><td>25</td></tr>
              <tr><th scope="row">{t('judge.r3', 'An honest budget')}</th><td>{t('judge.r3.d', 'Costs that are itemised, realistic and add up correctly.')}</td><td>20</td></tr>
              <tr><th scope="row">{t('judge.r4', 'Measurable results')}</th><td>{t('judge.r4.d', 'What will be different, and how you will show it.')}</td><td>20</td></tr>
              <tr><th scope="row">{t('judge.r5', 'Something that lasts')}</th><td>{t('judge.r5.d', 'Knowledge, skills, evidence, equipment or an activity that continues afterwards.')}</td><td>15</td></tr>
            </tbody>
            <tfoot><tr><td colSpan={2}>Total</td><td>100</td></tr></tfoot>
          </table>
        </div>
        <div>
          <h3 className="prog-subhead">{t('judge.final.title', 'At the fair, judges look at')}</h3>
          <ul className="prog-list">
            {[
              t('judge.f1', 'The problem and why it matters'),
              t('judge.f2', 'Your understanding of the science or technology'),
              t('judge.f3', 'The quality of the method or design'),
              t('judge.f4', 'Your own ideas and decisions'),
              t('judge.f5', 'Evidence and analysis'),
              t('judge.f6', 'How a prototype performed in testing'),
              t('judge.f7', 'Honesty about limits and failed attempts'),
              t('judge.f8', 'Whether the impact claimed is realistic'),
              t('judge.f9', 'How clearly you explain and answer questions'),
              t('judge.f10', 'Your notebook, report and display'),
            ].map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="prog-subhead">{t('judge.awards.title', 'Awards')}</h3>
          <p className="prog-prose">{t('judge.awards', 'The awards for each year are announced by the Foundation. The 2026/27 handbook lists an Overall Science Fair Champion, category awards, and awards for the most innovative solution, engineering design, scientific investigation, use of data, environmental and sustainability impact, agriculture and food security, technology and computing, communication, a promising young researcher, and community impact.')}</p>
        </div>
      </ProgramSection>

      <ProgramSection
        id="funding"
        title={t('fund.title', 'Project funding')}
        intro={<p>{t('fund.intro', 'Some approved projects receive Foundation funding. It is not guaranteed, and a project does not need it to do well.')}</p>}
      >
        <Definitions
          items={[
            { term: t('fund.yes.term', 'What it can pay for'), detail: t('fund.yes', 'What the project genuinely needs: consumable materials, components, sensors, fabrication materials, approved laboratory supplies and printing for the project.') },
            { term: t('fund.no.term', 'What it does not pay for'), detail: t('fund.no', 'School fees, a personal laptop or phone, payments to team members, work done before approval, travel the project does not need, and unexplained contingency amounts.') },
            { term: t('fund.records.term', 'If you are funded'), detail: t('fund.records', 'Your school may sign a short agreement. Keep every receipt and a ledger of what you spend; you may be asked for a midpoint update, and a final report is due within two weeks of finishing.') },
            { term: t('fund.change.term', 'If something changes'), detail: t('fund.change', 'Tell us. Reporting a genuine problem is not misconduct; hiding one is.') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="downloads"
        title={t('dl.title', 'Downloads')}
        intro={<p>{t('dl.intro', 'Read the handbook before you start, and fill in the workbook as you go. The workbook is your full proposal.')}</p>}
      >
        <Downloads
          items={[
            { href: '/science-fair-or-projects/Student Project Handbook 2026-27.pdf', title: t('dl.1', 'Student Project Handbook 2026/27'), detail: t('dl.1.d', 'PDF, 58 pages: the rules, how to plan and write a proposal, safety, judging and awards') },
            { href: '/science-fair-or-projects/Jdiobe_STEM_Student_Research_Innovation_Handbook_Proposal_Workbook_v1.0.docx', title: t('dl.2', 'Proposal Workbook'), detail: t('dl.2.d', 'Word document to fill in') },
            { href: '/science-fair-or-projects/Science Fair Projeect Proposal Form.docx', title: t('dl.3', 'Short proposal form'), detail: t('dl.3.d', 'Word document') },
          ]}
        />
      </ProgramSection>

      <ProgramSection
        id="register"
        title={t('reg.title', 'Register your project')}
        intro={<p>{t('reg.intro', 'Registering tells us who you are, who your teacher mentor is, and what you plan to work on. It is the online step; your full proposal is the completed workbook.')}</p>}
        wide
      >
        <ProposalForm />
      </ProgramSection>

      <ProgramSection id="questions" title={t('faq.title', 'Questions')}>
        <Faq
          items={[
            { q: t('faq.1.q', 'Do I need an expensive project?'), a: t('faq.1.a', 'No. Cost is not a measure of quality. A focused project with good evidence can be excellent using simple materials.') },
            { q: t('faq.2.q', 'Can I use an idea I saw online?'), a: t('faq.2.a', 'You can learn from existing ideas, but copying a project is not acceptable. Acknowledge the source and develop your own question, comparison, improvement or application.') },
            { q: t('faq.3.q', 'What if my experiment does not work?'), a: t('faq.3.a', 'Record what happened, work out the likely causes, improve the method where it is safe to, and explain what you learned. Judges value honesty about failed attempts.') },
            { q: t('faq.4.q', 'Can a university or company mentor help me?'), a: t('faq.4.a', 'Yes, as long as the help is appropriate and disclosed, and you can explain all the work yourself.') },
            { q: t('faq.5.q', 'Can I use AI?'), a: t('faq.5.a', 'Responsible help may be allowed, but it must not replace your work or understanding. Declare any significant use and check what it produces.') },
            { q: t('faq.6.q', 'Can my parent build the prototype?'), a: t('faq.6.a', 'A parent can help safely with a task you are not allowed to do, but you must design the project, make the key decisions and say what help you had.') },
            { q: t('faq.7.q', 'Can I change my project after approval?'), a: t('faq.7.a', 'Small changes are normal. Changes to the question, budget, safety, ethics or anything involving people should be agreed with your teacher and may need Foundation approval.') },
            { q: t('faq.8.q', 'What if my proposal is not selected?'), a: t('faq.8.a', 'Where the competition allows, you will get feedback to improve it. A rejected proposal does not mean you are not capable of STEM.') },
          ]}
        />
      </ProgramSection>

      <ProgramCta
        title={t('cta.title', 'Help a project reach the fair')}
        body={t('cta.body', 'Engineers, scientists and university staff can support students alongside their teacher mentors. Sponsors pay for the materials a project needs.')}
        actions={[
          { href: '/volunteers', label: t('cta.action', 'Volunteer as a mentor') },
          { href: '/contact', label: t('cta.action2', 'Sponsor the fair') },
        ]}
      />
      <OtherProgrammes current="/secondary-research" />
    </main>
  );
}
