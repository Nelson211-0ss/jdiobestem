import Link from 'next/link';
import { text } from '@/lib/site-content';
import Icon from '@/components/Icon';
import ProposalForm from '@/components/ProposalForm';

export default function SecondaryResearchContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
      <main>
          {/* Hero */}
          <header className="page-hero">
            <img src="/images/robot.jpeg" alt="" className="page-hero__bg" width="1600" height="900"/>
            <div className="page-hero__overlay" aria-hidden="true"></div>
            <div className="page-hero__inner">
              <p className="page-hero__eyebrow">{text(blocks, "p.uganda-national-secondary-school-science", "Uganda National Secondary School Science Fair")}</p>
              <h1>{text(blocks, "h1.projects-research-and-the-science", "Projects, research, and the Science Fair")}</h1>
              <p className="page-hero__lede">{text(blocks, "p.secondary-school-students-design-a", "Secondary school students design a real project, write a real proposal, and defend it in front of judges — from a school fair, to a regional fair, to the national fair. No laboratory required.")}</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a href="#apply" className="btn-on-brand">
                  Register your project
                </a>
                <a href="#downloads" className="btn-outline-on-brand">
                  <Icon name="download" className="h-4 w-4" />
                  Get the handbook
                </a>
              </div>
            </div>
          </header>

          {/* Program Overview */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="compass" className="h-4 w-4"/>
                  {' '}Program Overview
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.discover-research-before-university", "Discover research before university")}</h2>
                <p className="sr-fade-up mx-auto mt-4 text-base leading-7 text-gray-600">{text(blocks, "p.the-program-introduces-talented-secondary", "The program introduces talented secondary school students to scientific research, engineering design, innovation, and entrepreneurship. Students work alongside university faculty, engineers, scientists, and industry professionals to develop practical solutions to real-world challenges while building the skills that prepare them for university and STEM careers.")}</p>
              </div>
              <div className="sr-stagger mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-2.5">
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Aerospace Engineering</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Robotics</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Artificial Intelligence</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Computer Programming</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Environmental Science</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Renewable Energy</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Biomedical Engineering</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Agricultural Technology</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Drone Technology (UAVs)</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Data Science</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Mechanical Engineering</span>
                <span className="sr-fade-up rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Civil Engineering</span>
              </div>
            </div>
          </section>

          {/* Why Join */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="check-square" className="h-4 w-4"/>
                  {' '}Why Join?
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.what-students-will-do", "What students will do")}</h2>
              </div>
              <div className="sr-stagger mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-3">
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Conduct real research projects</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Learn from university professors</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Work with STEM professionals</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Develop leadership skills</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Present research findings</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Build university-ready portfolios</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Participate in STEM competitions</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Publish research where appropriate</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Develop innovation &amp; entrepreneurship skills</span></div>
              </div>
            </div>
          </section>

          {/* How it works — the stages set out in the handbook. Dates are marked
               as a foundation policy placeholder there, so none are stated here. */}
          <section className="section-tight" id="how-it-works">
            <div className="container-page">
              <div className="section-head">
                <p className="eyebrow">{text(blocks, "p.how-it-works", "How it works")}</p>
                <h2>{text(blocks, "h2.from-an-idea-to-the", "From an idea to the national fair")}</h2>
                <p className="lede">{text(blocks, "p.projects-advance-from-a-school", "Projects advance from a school-level fair, to a regional fair, to the national fair. Dates for each stage are announced to schools each year.")}</p>
              </div>

              <ol className="stage-list">
                {[
                  ['Handbook released to schools', 'Every school partner receives the Student Research & Innovation Handbook and the Proposal Workbook.'],
                  ['Choose a project, find a mentor', 'You pick a problem worth solving and a teacher agrees to mentor you. Nothing starts without a mentor.'],
                  ['Submit your proposal', 'The completed Proposal Workbook, signed by you, your mentor and your head teacher. Every project submits one before any experimenting, building or fieldwork begins.'],
                  ['Review and feedback', 'At least two independent reviewers score the proposal out of 100 against a standard rubric, checking safety, ethics and feasibility. You get written feedback either way.'],
                  ['Research and build', 'You run the project you proposed, keeping records as you go — data, receipts, and what went wrong as well as what worked.'],
                  ['School-level fair', 'You present at your own school first.'],
                  ['Regional fair', 'Selected projects go forward to the regional fair.'],
                  ['National fair', 'The Uganda National Secondary School Science Fair, with awards across categories and special recognitions for innovation, community impact and scientific rigour.'],
                ].map(([title, detail], i) => (
                  <li key={title} className="stage-item">
                    <span className="stage-number" aria-hidden="true">{i + 1}</span>
                    <div>
                      <h3 className="stage-title">{title}</h3>
                      <p className="stage-text">{detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Categories — the six from the Student Research & Innovation Handbook. */}
          <section className="section-tight">
            <div className="container-page">
              <div className="section-head">
                <p className="eyebrow">Categories</p>
                <h2>{text(blocks, "h2.six-categories-to-enter", "Six categories to enter")}</h2>
                <p className="lede">{text(blocks, "p.every-project-is-entered-in", "Every project is entered in one category. Choose the one your work sits in most naturally — judges compare projects within a category, not across them.")}</p>
              </div>

              <div className="grid-cards">
                {[
                  ['Physical Sciences', 'Physics, Chemistry, Materials'],
                  ['Life & Environmental Sciences', 'Biology, Agriculture, Ecology, Public Health'],
                  ['Engineering & Technology', 'Devices, Mechanical and Electrical Systems, Renewable Energy'],
                  ['Computer Science & Software', 'Applications, Websites, Data Systems, AI Tools'],
                  ['Innovation & Entrepreneurship', 'New Products, Business Models with a Technical Core'],
                  ['Community & Social Impact', 'Projects that change something where you live'],
                ].map(([name, detail]) => (
                  <article key={name} className="card-plain">
                    <h3 className="text-lg font-extrabold tracking-tight text-charcoal-900">{name}</h3>
                    <p className="mt-2 text-charcoal-600">{detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Example Projects */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="box" className="h-4 w-4"/>
                  {' '}Example Student Projects
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.imagine-what-you-could-build", "Imagine what you could build")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="droplet" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.autonomous-water-monitoring-robot", "Autonomous Water Monitoring Robot")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.a-student-built-solution-for", "A student-built solution for testing water quality.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="feather" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.ai-crop-disease-detection", "AI Crop Disease Detection")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.using-technology-to-support-farmers", "Using technology to support farmers.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="sun" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.low-cost-solar-irrigation-system", "Low-Cost Solar Irrigation System")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.a-low-cost-solution-for", "A low-cost solution for agriculture.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="send" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.drone-based-medical-delivery", "Drone-Based Medical Delivery")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.exploring-how-uavs-can-support", "Exploring how UAVs can support healthcare access.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="git-merge" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.smart-traffic-management", "Smart Traffic Management")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.smarter-safer-roads-through-technology", "Smarter, safer roads through technology.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="cloud-rain" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.flood-prediction-using-ai", "Flood Prediction Using AI")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.early-warning-to-protect-communities", "Early warning to protect communities.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="zap" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.renewable-energy-solutions", "Renewable Energy Solutions")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.clean-power-for-homes-and", "Clean power for homes and schools.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><Icon name="refresh-cw" className="h-6 w-6 text-orange-700"/><h3 className="mt-4 text-base font-bold text-gray-900">{text(blocks, "h3.plastic-recycling-innovation", "Plastic Recycling Innovation")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.turning-waste-into-opportunity", "Turning waste into opportunity.")}</p></div>
              </div>
            </div>
          </section>

          {/* Program Outcomes (counters) */}
          <section id="impact" className="surface-brand py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                  <Icon name="bar-chart-2" className="h-4 w-4"/>
                  {' '}Program Impact
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.research-that-adds-up", "Research that adds up")}</h2>
              </div>
              <dl className="sr-stagger mt-9 grid grid-cols-2 gap-6 text-center md:grid-cols-3 lg:grid-cols-5">
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="50" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Students trained annually</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="20" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Research projects completed</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="10" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">University research mentors</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="5" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Research presentations each year</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="100" data-suffix="%">0%</dt><dd className="mt-2 text-sm text-orange-100">Hands-on project participation</dd></div>
              </dl>
            </div>
          </section>

          {/* Facilities + Symposium */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
              <div className="text-center md:text-left">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="home" className="h-4 w-4"/>
                  {' '}Research Facilities
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{text(blocks, "h2.where-students-will-work", "Where students will work")}</h2>
                <ul className="sr-stagger mt-6 grid grid-cols-2 gap-3">
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="thermometer" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">University laboratories</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="tool" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Engineering workshops</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="monitor" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Computer laboratories</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="box" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Maker spaces</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="zap" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Partner innovation hubs</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="map-pin" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Field research sites</span></li>
                </ul>
              </div>
              <div className="text-center md:text-left">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="award" className="h-4 w-4"/>
                  {' '}Annual Research Symposium
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{text(blocks, "h2.present-compete-inspire", "Present. Compete. Inspire.")}</h2>
                <p className="sr-fade-up mt-4 text-base leading-7 text-gray-600">{text(blocks, "p.every-participating-student-presents-their", "Every participating student presents their research at the Jdiobe STEM Research Symposium before judges from universities and industry. Award categories may include:")}</p>
                <ul className="sr-stagger mt-6 grid grid-cols-2 gap-3">
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="tool" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Best Engineering Project</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="zap" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Best Innovation</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="file-text" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Best Research Paper</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="cpu" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Best Robotics Project</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="thumbs-up" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">People&apos;s Choice Award</span></li>
                  <li className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-4 shadow-card"><Icon name="star" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Outstanding Young Researcher</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Who may enter */}
          <section className="section-tight" id="who-can-enter">
            <div className="container-page">
              <div className="split">
                <div>
                  <p className="eyebrow">{text(blocks, "p.who-may-enter", "Who may enter")}</p>
                  <h2 className="mt-3">{text(blocks, "h2.any-student-any-school", "Any student, any school")}</h2>
                  <p className="mt-5 text-lg leading-8 text-charcoal-600">{text(blocks, "p.the-science-fair-is-open", "The Science Fair is open to students enrolled at a Ugandan secondary school, entering individually or as a team, supervised by a teacher mentor.")}</p>
                  <p className="mt-4 text-lg leading-8 text-charcoal-600">{text(blocks, "p.you-do-not-need-a", "You do not need a laboratory, and you do not need previous research experience. The strongest projects usually come from noticing something wrong close to home and being stubborn about measuring it.")}</p>
                  <p className="mt-4 text-charcoal-500">{text(blocks, "p.exact-class-levels-any-age", "Exact class levels, any age limits and maximum team size are confirmed with schools each year when the handbook is released.")}</p>
                </div>

                <div className="card-plain">
                  <h3 className="text-lg font-extrabold tracking-tight text-charcoal-900">{text(blocks, "h3.what-it-costs", "What it costs")}</h3>
                  <p className="mt-3 text-charcoal-600">{text(blocks, "p.nothing-there-is-no-entry", "Nothing. There is no entry fee, and no money passes to your school.")}</p>
                  <h3 className="mt-7 text-lg font-extrabold tracking-tight text-charcoal-900">{text(blocks, "h3.can-my-project-be-funded", "Can my project be funded?")}</h3>
                  <p className="mt-3 text-charcoal-600">{text(blocks, "p.the-foundation-may-fund-part", "The Foundation may fund part of an approved project where there is demonstrated need, based on the itemised budget in your workbook. Funding is never guaranteed, and it is not required to take part — plenty of strong projects cost almost nothing.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* What a proposal contains */}
          <section className="section-tight">
            <div className="container-page">
              <div className="section-head">
                <p className="eyebrow">{text(blocks, "p.the-proposal", "The proposal")}</p>
                <h2>{text(blocks, "h2.what-you-are-asked-to", "What you are asked to write")}</h2>
                <p className="lede">{text(blocks, "p.the-proposal-workbook-walks-you", "The Proposal Workbook walks you through twenty-two sections. It is long on purpose: most of it is teaching, and you fill in the blanks as you go.")}</p>
              </div>

              <div className="grid-cards">
                {[
                  ['The problem', 'Who is affected, where, how seriously, and how you know. A topic is not a problem statement — the workbook shows the difference with a worked example.'],
                  ['Background research', 'At least five sources, and a summary in your own words of what is already known and what is not.'],
                  ['Objectives and questions', 'SMART objectives, then the research questions or the design specifications your project has to meet.'],
                  ['Method', 'The scientific method or the engineering design process, your variables and controls, and a numbered procedure someone else could follow.'],
                  ['Ethics and safety', 'Consent, animal welfare, environmental impact, a risk assessment matrix and emergency contacts. Every project completes this, however safe it looks.'],
                  ['AI declaration', 'Every AI tool used, where, and how. Grammar, brainstorming, translation and coding syntax are fine. Generating your idea, data or conclusions is not.'],
                  ['Budget', 'Itemised in Ugandan Shillings, with a supplier or quote reference against each line, and a note on where each figure came from.'],
                  ['Timeline and impact', 'Month-by-month plan, expected results and how the project keeps its value after the fair.'],
                ].map(([title, detail]) => (
                  <article key={title} className="card-plain">
                    <h3 className="text-lg font-extrabold tracking-tight text-charcoal-900">{title}</h3>
                    <p className="mt-2 text-charcoal-600">{detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Downloads */}
          <section className="section-tight" id="downloads">
            <div className="container-page">
              <div className="panel-dark">
                <div className="split">
                  <div className="handbook-cover">
                    <img
                      src="/science-fair-or-projects/handbook-cover.jpg"
                      alt="Cover of the Jdiobe STEM Foundation Students Handbook 2026/27"
                      width={1200}
                      height={1690}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div>
                    <p className="eyebrow">Download</p>
                    <h2 className="mt-3">{text(blocks, "h2.the-handbook-and-the-forms", "The handbook and the forms")}</h2>
                    <p className="mt-5 text-lg leading-8 text-white/80">{text(blocks, "p.read-the-handbook-before-you", "Read the handbook before you start. Fill in the workbook as you go — it is designed to be worked through, not filled in at the end.")}</p>

                    <ul className="download-list">
                      <li>
                        <a href="/science-fair-or-projects/Jdiobe_STEM_Student_Research_Innovation_Handbook_Proposal_Workbook_v1.0.docx" download>
                          <Icon name="download" />
                          <span>
                            <strong>Student Research &amp; Innovation Handbook</strong>
                            <small>Proposal Workbook v1.0 &middot; DOCX &middot; 71 KB</small>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="/science-fair-or-projects/Science Fair Projeect Proposal Form.docx" download>
                          <Icon name="download" />
                          <span>
                            <strong>Student Project Proposal Form</strong>
                            <small>Short form &middot; DOCX &middot; 60 KB</small>
                          </span>
                        </a>
                      </li>
                      <li>
                        <a href="/science-fair-or-projects/Student Project Handbook.pdf" download>
                          <Icon name="download" />
                          <span>
                            <strong>Students Handbook 2026/27</strong>
                            <small>PDF &middot; 59 KB</small>
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Register */}
          <section className="section-tight" id="apply">
            <div className="container-page">
              <div className="section-head">
                <p className="eyebrow">Apply</p>
                <h2>{text(blocks, "h2.register-your-project", "Register your project")}</h2>
                <p className="lede">{text(blocks, "p.tell-us-who-you-are", "Tell us who you are and what you want to work on. This is the online step; the formal submission is the completed workbook, signed by you, your mentor and your head teacher, with the school stamp.")}</p>
              </div>

              <div className="mx-auto max-w-3xl">
                <ProposalForm />
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
              <div className="text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  <Icon name="help-circle" className="h-4 w-4"/>
                  {' '}Frequently Asked Questions
                </p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.answers-for-applicants", "Answers for applicants")}</h2>
              </div>
              <div className="sr-stagger mt-10 space-y-3">
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>Who can apply?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">Secondary school students with a strong interest in science, engineering, technology, or innovation are encouraged to apply.</div>
                </div>
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>Is there a cost?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">We work to keep the program accessible. Details on any fees or available support are shared during the application process.</div>
                </div>
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>How long is the program?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">Students progress through a structured pathway from bootcamp to a research project and a final presentation at the symposium.</div>
                </div>
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>Do I need previous research experience?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">No. The research bootcamp is designed to teach the skills you need, whatever your starting point — curiosity and commitment matter most.</div>
                </div>
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>Can students from outside Uganda apply?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">Our focus is on students in Uganda, but we welcome interest from the wider region. Reach out and we&apos;ll advise on eligibility.</div>
                </div>
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>Will I receive a certificate?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">Yes. Students who complete the program receive recognition of their participation and research work.</div>
                </div>
                <div className="sr-fade-up overflow-hidden rounded-lg bg-white shadow-card">
                  <button className="faq-toggle flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900"><span>Will I be matched with a mentor?</span><Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/></button>
                  <div className="faq-content hidden px-5 pb-5 text-sm leading-6 text-gray-600">Yes. Selected students are matched with a faculty or industry mentor who guides their research project.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Partner CTA */}
          <section className="surface-brand py-14">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="sr-fade-up text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "h2.partner-with-us", "Partner with us")}</h2>
              <p className="sr-fade-up mx-auto mt-5 max-w-2xl text-base leading-7 text-orange-100">{text(blocks, "p.we-invite-universities-companies-researchers", "We invite universities, companies, researchers, engineers, sponsors, and schools to support student research and help build Africa's next generation of innovators.")}</p>
              <div className="sr-fade-up mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/volunteers" className="btn-on-brand">Become a Mentor</Link>
                <Link href="/donate" className="btn-outline-on-brand">Become a Sponsor</Link>
                <Link href="/contact" className="btn-outline-on-brand">Partner With Us</Link>
              </div>
            </div>
          </section>

        </main>
    </>
  );
}
