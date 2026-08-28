import Link from 'next/link';
import { text } from '@/lib/site-content';
import Icon from '@/components/Icon';

export default function YouthStemContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
      <main>
          {/* Hero */}
          <header className="page-hero">
            <img src="/images/hero-diy-stem-car.png" alt="" className="page-hero__bg" width="1600" height="900"/>
            <div className="page-hero__overlay" aria-hidden="true"></div>
            <div className="page-hero__inner">
              <p className="page-hero__eyebrow">{text(blocks, "p.youth-stem-school-program", "Youth STEM School Program")}</p>
              <h1>{text(blocks, "h1.inspiring-young-minds-building-future", "Inspiring young minds, building future innovators")}</h1>
              <p className="page-hero__lede">{text(blocks, "p.hands-on-stem-experiences-that", "Hands-on STEM experiences that introduce primary and middle school students to science, technology, engineering, and mathematics through fun, engaging, and interactive learning.")}</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-on-brand">Bring STEM to Your School</Link>
                <Link href="/volunteers" className="btn-outline-on-brand">Become a Volunteer</Link>
              </div>
            </div>
          </header>

          {/* Why this program matters */}
          <section className="py-12 md:py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-9 px-6 lg:grid-cols-2 lg:px-8">
              <div className="sr-fade-up overflow-hidden rounded-2xl">
                <img src="/images/catapilar.jpeg" alt="Students building and experimenting in a STEM workshop" className="aspect-[4/3] w-full object-cover lg:min-h-[380px]" width="1000" height="750" loading="lazy" decoding="async"/>
              </div>
              <div>
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700 justify-center md:justify-start w-full md:w-auto"><Icon name="smile" className="h-4 w-4"/> Why This Program Matters</p>
                <h2 className="sr-fade-up mt-3 text-center md:text-left text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.every-child-is-born-curious", "Every child is born curious")}</h2>
                <div className="mt-6 space-y-5 text-base leading-7 text-gray-600">
                  <p className="sr-fade-up">{text(blocks, "p.early-exposure-to-stem-helps", "Early exposure to STEM helps students develop confidence, creativity, teamwork, and problem-solving skills that prepare them for success in school and future careers.")}</p>
                  <p className="sr-fade-up">{text(blocks, "p.our-interactive-workshops-transform-classrooms", "Our interactive workshops transform classrooms into innovation labs where students learn by exploring, building, experimenting, and discovering — while introducing them to careers they may never have imagined.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Program highlights */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="star" className="h-4 w-4"/> Program Highlights</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.learning-that-sticks", "Learning that sticks")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid gap-6 md:grid-cols-3">
                <div className="sr-fade-up rounded-2xl bg-white p-8 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="tool" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.hands-on-learning", "Hands-On Learning")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.students-take-part-in-exciting", "Students take part in exciting experiments and engineering challenges that make STEM fun and engaging.")}</p>
                </div>
                <div className="sr-fade-up rounded-2xl bg-white p-8 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="users" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.stem-mentors", "STEM Mentors")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.volunteers-engineers-scientists-and-university", "Volunteers, engineers, scientists, and university students inspire young learners through mentorship and interactive activities.")}</p>
                </div>
                <div className="sr-fade-up rounded-2xl bg-white p-8 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white" aria-hidden="true"><Icon name="trending-up" className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.future-ready-skills", "Future-Ready Skills")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.students-build-creativity-communication-teamwork", "Students build creativity, communication, teamwork, leadership, and critical thinking that extend beyond the classroom.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* What students experience */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="activity" className="h-4 w-4"/> Program Activities</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.what-students-experience", "What students experience")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="thermometer" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.science-experiments", "Science Experiments")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.interactive-experiments-that-make-science", "Interactive experiments that make science exciting.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="cpu" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">Robotics</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.build-and-program-simple-robots", "Build and program simple robots.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="code" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">Coding</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.learn-programming-through-games-and", "Learn programming through games and challenges.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="send" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.drone-demonstrations", "Drone Demonstrations")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.experience-the-future-of-aviation", "Experience the future of aviation and technology.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="settings" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.engineering-challenges", "Engineering Challenges")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.design-build-test-and-improve", "Design, build, test, and improve creative solutions.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="target" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">STEM Games</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.collaborative-competitions-that-strengthen-teamwork", "Collaborative competitions that strengthen teamwork and problem solving.")}</p></div>
              </div>
            </div>
          </section>

          {/* STEM learning areas */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="book-open" className="h-4 w-4"/> STEM Learning Areas</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.four-pillars-of-discovery", "Four pillars of discovery")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                <article className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="thermometer" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">Science</h3><ul className="mt-3 space-y-1.5 text-sm text-gray-600"><li>Experiments</li><li>Biology</li><li>Chemistry</li><li>Physics</li></ul></article>
                <article className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="monitor" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">Technology</h3><ul className="mt-3 space-y-1.5 text-sm text-gray-600"><li>Digital Literacy</li><li>Computers</li><li>Coding</li><li>Internet Safety</li></ul></article>
                <article className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="tool" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">Engineering</h3><ul className="mt-3 space-y-1.5 text-sm text-gray-600"><li>Design Challenges</li><li>Bridge Building</li><li>Model Construction</li><li>Simple Machines</li></ul></article>
                <article className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="divide" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">Mathematics</h3><ul className="mt-3 space-y-1.5 text-sm text-gray-600"><li>Logic</li><li>Geometry</li><li>Problem Solving</li><li>Applied Mathematics</li></ul></article>
              </div>
            </div>
          </section>

          {/* A day with Jdiobe STEM */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="clock" className="h-4 w-4"/> A Typical STEM Day</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.a-day-with-jdiobe-stem", "A day with Jdiobe STEM")}</h2>
              </div>
              <ol className="sr-stagger mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">01</p><div className="mt-3 flex items-center gap-3"><Icon name="sun" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.welcome-icebreaker", "Welcome & Icebreaker")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">02</p><div className="mt-3 flex items-center gap-3"><Icon name="cast" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.interactive-presentation", "Interactive Presentation")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">03</p><div className="mt-3 flex items-center gap-3"><Icon name="tool" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.hands-on-workshops", "Hands-On Workshops")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">04</p><div className="mt-3 flex items-center gap-3"><Icon name="settings" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.engineering-challenge", "Engineering Challenge")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">05</p><div className="mt-3 flex items-center gap-3"><Icon name="coffee" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">Lunch Break</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">06</p><div className="mt-3 flex items-center gap-3"><Icon name="target" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.team-competition", "Team Competition")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">07</p><div className="mt-3 flex items-center gap-3"><Icon name="award" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.awards-certificates", "Awards & Certificates")}</h3></div></li>
                <li className="sr-fade-up flex items-center justify-center rounded-2xl bg-orange-500 p-6 text-center text-white"><div className="flex items-center gap-3"><Icon name="camera" className="h-5 w-5"/><p className="font-semibold">Group Photo</p></div></li>
              </ol>
            </div>
          </section>

          {/* What students take away */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="gift" className="h-4 w-4"/> What Students Take Away</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.skills-for-life", "Skills for life")}</h2>
              </div>
              <div className="sr-stagger mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-3">
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Curiosity</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Confidence</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Creativity</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Leadership</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Teamwork</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Communication</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Critical Thinking</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Problem Solving</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">STEM Career Awareness</span></div>
              </div>
            </div>
          </section>

          {/* STEM career exploration */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="compass" className="h-4 w-4"/> STEM Career Exploration</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.what-can-you-become", "What can you become?")}</h2>
                <p className="sr-fade-up mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">{text(blocks, "p.helping-children-connect-today-s", "Helping children connect today's activities with tomorrow's careers.")}</p>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="navigation" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Aerospace Engineer</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="activity" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Medical Doctor</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="code" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Software Developer</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="thermometer" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Scientist</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="cpu" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Robotics Engineer</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="zap" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Electrical Engineer</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="home" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Civil Engineer</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="wind" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Environmental Scientist</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="star" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Space Scientist</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="bar-chart-2" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Data Scientist</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="send" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Drone Pilot</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="settings" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Mechanical Engineer</span></div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section className="bg-white py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="image" className="h-4 w-4"/> Photo Gallery</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.see-stem-in-action", "See STEM in action")}</h2>
              </div>
              <div className="sr-stagger mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
                <img src="/images/robot.jpeg" alt="Students building robots" className="h-40 w-full rounded-lg object-cover sm:h-52" width="500" height="330" loading="lazy" decoding="async"/>
                <img src="/images/catapilar.jpeg" alt="Science experiments" className="h-40 w-full rounded-lg object-cover sm:h-52" width="500" height="330" loading="lazy" decoding="async"/>
                <img src="/images/inspect.jpeg" alt="Students inspecting a build" className="h-40 w-full rounded-lg object-cover sm:h-52" width="500" height="330" loading="lazy" decoding="async"/>
                <img src="/images/plane.jpg" alt="Aviation and drone demonstration" className="h-40 w-full rounded-lg object-cover sm:h-52" width="500" height="330" loading="lazy" decoding="async"/>
                <img src="/images/teachers.jpeg" alt="Classroom STEM activities" className="h-40 w-full rounded-lg object-cover sm:h-52" width="500" height="330" loading="lazy" decoding="async"/>
                <img src="/images/1718038140753.jpeg" alt="Volunteers mentoring students" className="h-40 w-full rounded-lg object-cover object-top sm:h-52" width="500" height="330" loading="lazy" decoding="async"/>
              </div>
            </div>
          </section>

          {/* Program impact (counters) */}
          <section id="impact" className="surface-brand py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200"><Icon name="bar-chart-2" className="h-4 w-4"/> Program Impact</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.creating-opportunities-through-stem", "Creating opportunities through STEM")}</h2>
              </div>
              <dl className="sr-stagger mt-9 grid grid-cols-2 gap-6 text-center md:grid-cols-3 lg:grid-cols-5">
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="2500" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Students Inspired</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="40" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Schools Engaged</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="150" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">STEM Activities</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="100" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Volunteers</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="15" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Districts Reached</dd></div>
              </dl>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="message-circle" className="h-4 w-4"/> Testimonials</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.in-their-words", "In their words")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid gap-6 md:grid-cols-2">
                <figure className="sr-fade-up rounded-2xl bg-white p-8 shadow-card"><Icon name="star" className="h-6 w-6 text-orange-700"/><blockquote className="mt-4 text-lg leading-8 text-gray-800">&quot;Before this program I had never touched a robot. Now I want to become an engineer.&quot;</blockquote><figcaption className="mt-4 text-sm font-semibold text-orange-700">Secondary School Student</figcaption></figure>
                <figure className="sr-fade-up rounded-2xl bg-white p-8 shadow-card"><Icon name="star" className="h-6 w-6 text-orange-700"/><blockquote className="mt-4 text-lg leading-8 text-gray-800">&quot;Our students became much more excited about science after participating.&quot;</blockquote><figcaption className="mt-4 text-sm font-semibold text-orange-700">School Head Teacher</figcaption></figure>
              </div>
            </div>
          </section>

          {/* STEM pathway */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="git-branch" className="h-4 w-4"/> Our STEM Pathway</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.this-is-just-the-beginning", "This is just the beginning")}</h2>
                <p className="sr-fade-up mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">{text(blocks, "p.we-support-students-from-their", "We support students from their first exposure to STEM all the way to university and professional careers.")}</p>
              </div>
              <ol className="sr-stagger mx-auto mt-9 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-orange-500 p-5 text-center text-white"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25"><Icon name="smile" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold">{text(blocks, "p.youth-stem-school", "Youth STEM School")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="book-open" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.secondary-research", "Secondary Research")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="award" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.scholarships", "Scholarships")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="search" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.university-research", "University Research")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="briefcase" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.internships-mentorship", "Internships & Mentorship")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="trending-up" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.careers-leadership", "Careers & Leadership")}</p></li>
              </ol>
            </div>
          </section>

          {/* CTA */}
          <section className="surface-brand py-14">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="sr-fade-up text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "h2.ready-to-inspire-the-next", "Ready to inspire the next generation?")}</h2>
              <p className="sr-fade-up mx-auto mt-5 max-w-2xl text-base leading-7 text-orange-100">{text(blocks, "p.the-jdiobe-stem-foundation-partners", "The Jdiobe STEM Foundation partners with schools to deliver exciting STEM experiences that spark curiosity and prepare students for the future.")}</p>
              <div className="sr-fade-up mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-on-brand">Request a School Visit</Link>
                <Link href="/volunteers" className="btn-outline-on-brand">Become a Volunteer</Link>
                <Link href="/donate" className="btn-outline-on-brand">Support the Program</Link>
              </div>
            </div>
          </section>

        </main>
    </>
  );
}
