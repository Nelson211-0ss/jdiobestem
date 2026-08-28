import Link from 'next/link';
import { text } from '@/lib/site-content';
import Icon from '@/components/Icon';

export default function CommunityOutreachContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
      <main>
          {/* Hero */}
          <header className="page-hero">
            <img src="/images/teachers.jpeg" alt="" className="page-hero__bg" width="1600" height="900"/>
            <div className="page-hero__overlay" aria-hidden="true"></div>
            <div className="page-hero__inner">
              <p className="page-hero__eyebrow">{text(blocks, "p.community-stem-outreach", "Community STEM Outreach")}</p>
              <h1>{text(blocks, "h1.bringing-stem-education-beyond-the", "Bringing STEM education beyond the classroom")}</h1>
              <p className="page-hero__lede">{text(blocks, "p.we-partner-with-schools-communities", "We partner with schools, communities, universities, and industry to deliver engaging STEM experiences that inspire curiosity, foster innovation, and expand educational opportunities for learners of all ages.")}</p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-on-brand">Request an Outreach Event</Link>
                <Link href="/contact" className="btn-outline-on-brand">Partner With Us</Link>
              </div>
            </div>
          </header>

          {/* Mission */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
              <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="target" className="h-4 w-4"/> Our Mission</p>
              <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.making-stem-accessible-to-every", "Making STEM accessible to every community")}</h2>
              <p className="sr-fade-up mt-6 text-base leading-7 text-gray-600">{text(blocks, "p.every-student-deserves-the-opportunity", "Every student deserves the opportunity to discover science, technology, engineering, and mathematics — regardless of where they live or their background. Through community outreach we bring STEM directly to schools, community centers, libraries, and public events, creating experiences that inspire lifelong learning and future careers.")}</p>
            </div>
          </section>

          {/* What we do */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="layers" className="h-4 w-4"/> Our Outreach Programs</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">What we do</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="thermometer" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.stem-workshops", "STEM Workshops")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.interactive-science-and-engineering-activities", "Interactive science and engineering activities designed to spark curiosity.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="cpu" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.robotics-demonstrations", "Robotics Demonstrations")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.students-explore-robotics-through-live", "Students explore robotics through live demonstrations and beginner programming.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="send" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.drone-aviation-experiences", "Drone & Aviation Experiences")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.hands-on-exposure-to-drones", "Hands-on exposure to drones, aerospace engineering, and aviation careers.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="droplet" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.science-discovery-days", "Science Discovery Days")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.exciting-experiments-that-make-science", "Exciting experiments that make science fun and memorable.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="code" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.technology-coding-sessions", "Technology & Coding Sessions")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.students-learn-digital-skills-coding", "Students learn digital skills, coding, and emerging technologies.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white"><Icon name="mic" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.stem-career-talks", "STEM Career Talks")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.professionals-share-their-educational-journeys", "Professionals share their educational journeys, career experiences, and advice.")}</p></div>
              </div>
            </div>
          </section>

          {/* Where we serve */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="map-pin" className="h-4 w-4"/> Where We Serve</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.we-bring-stem-to", "We bring STEM to")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="home" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Primary Schools</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="book" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Secondary Schools</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="users" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Community Centers</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="book-open" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Libraries</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="flag" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">STEM Festivals</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="globe" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Rural Communities</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="award" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Universities</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="briefcase" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-semibold text-gray-800">Corporate Outreach</span></div>
              </div>
            </div>
          </section>

          {/* Typical event timeline */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="clock" className="h-4 w-4"/> A Typical Outreach Event</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.how-a-day-unfolds", "How a day unfolds")}</h2>
              </div>
              <ol className="sr-stagger mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">01</p><div className="mt-3 flex items-center gap-3"><Icon name="sun" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.welcome-introduction", "Welcome & Introduction")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">02</p><div className="mt-3 flex items-center gap-3"><Icon name="cast" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.interactive-presentation", "Interactive Presentation")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">03</p><div className="mt-3 flex items-center gap-3"><Icon name="tool" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.hands-on-activity-stations", "Hands-On Activity Stations")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">04</p><div className="mt-3 flex items-center gap-3"><Icon name="settings" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.engineering-challenge", "Engineering Challenge")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">05</p><div className="mt-3 flex items-center gap-3"><Icon name="compass" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.career-exploration", "Career Exploration")}</h3></div></li>
                <li className="sr-fade-up rounded-2xl bg-white p-4 sm:p-6 shadow-card"><p className="text-sm font-bold text-orange-700">06</p><div className="mt-3 flex items-center gap-3"><Icon name="help-circle" className="h-5 w-5 shrink-0 text-orange-700"/><h3 className="text-base font-semibold">{text(blocks, "h3.questions-discussion", "Questions & Discussion")}</h3></div></li>
                <li className="sr-fade-up col-span-2 rounded-2xl bg-orange-500 p-4 sm:p-6 text-white"><div className="flex items-center gap-3"><Icon name="award" className="h-5 w-5"/><h3 className="text-base font-semibold">{text(blocks, "h3.certificates-group-photo", "Certificates & Group Photo")}</h3></div></li>
              </ol>
            </div>
          </section>

          {/* What participants experience */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="zap" className="h-4 w-4"/> What Participants Experience</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.hands-on-from-start-to", "Hands-on from start to finish")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="droplet" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Conduct science experiments</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="cpu" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Build and interact with robots</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="send" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Experience drone technology</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="settings" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Solve engineering challenges</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="user-check" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Meet STEM professionals</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="compass" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Learn about STEM careers</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="award" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Participate in competitions</span></div>
                <div className="sr-fade-up flex items-center gap-3 rounded-lg bg-white p-5 shadow-card"><Icon name="users" className="h-5 w-5 shrink-0 text-orange-700"/><span className="text-sm font-medium text-gray-800">Develop teamwork &amp; leadership</span></div>
              </div>
            </div>
          </section>

          {/* Featured outreach activities */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="star" className="h-4 w-4"/> Featured Outreach Activities</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.stem-in-the-community", "STEM in the community")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid gap-6 sm:grid-cols-2">
                <article className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                  <img src="/images/IMG_8893.jpg" alt="STEM festival exhibition" className="aspect-[16/9] w-full object-cover" width="700" height="394" loading="lazy" decoding="async"/>
                  <div className="p-6"><h3 className="text-lg font-bold text-gray-900">{text(blocks, "h3.stem-festival-exhibitions", "STEM Festival Exhibitions")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.interactive-booths-featuring-robotics-engineering", "Interactive booths featuring robotics, engineering, and technology demonstrations.")}</p></div>
                </article>
                <article className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                  <img src="/images/catapilar.jpeg" alt="Science in the community" className="aspect-[16/9] w-full object-cover" width="700" height="394" loading="lazy" decoding="async"/>
                  <div className="p-6"><h3 className="text-lg font-bold text-gray-900">{text(blocks, "h3.science-in-the-community", "Science in the Community")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.hands-on-experiments-designed-to", "Hands-on experiments designed to inspire curiosity and scientific thinking.")}</p></div>
                </article>
                <article className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                  <img src="/images/robot.jpeg" alt="Engineering challenge day" className="aspect-[16/9] w-full object-cover" width="700" height="394" loading="lazy" decoding="async"/>
                  <div className="p-6"><h3 className="text-lg font-bold text-gray-900">{text(blocks, "h3.engineering-challenge-days", "Engineering Challenge Days")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.students-collaborate-in-teams-to", "Students collaborate in teams to design, build, and test engineering solutions.")}</p></div>
                </article>
                <article className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                  <img src="/images/plane.jpg" alt="Drone discovery workshop" className="aspect-[16/9] w-full object-cover" width="700" height="394" loading="lazy" decoding="async"/>
                  <div className="p-6"><h3 className="text-lg font-bold text-gray-900">{text(blocks, "h3.drone-discovery-workshops", "Drone Discovery Workshops")}</h3><p className="mt-2 text-sm leading-6 text-gray-600">{text(blocks, "p.learn-how-drones-are-transforming", "Learn how drones are transforming agriculture, healthcare, and emergency response.")}</p></div>
                </article>
              </div>
            </div>
          </section>

          {/* Why it matters */}
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="heart" className="h-4 w-4"/> Why It Matters</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.why-community-stem-outreach-matters", "Why community STEM outreach matters")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="eye" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.inspire-curiosity", "Inspire Curiosity")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.introduce-students-to-exciting-stem", "Introduce students to exciting STEM concepts through engaging experiences.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="shield" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.build-confidence", "Build Confidence")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.help-young-learners-develop-problem", "Help young learners develop problem-solving and critical thinking skills.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="unlock" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.expand-opportunities", "Expand Opportunities")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.connect-students-with-mentors-educational", "Connect students with mentors, educational pathways, and future careers.")}</p></div>
                <div className="sr-fade-up rounded-2xl bg-white p-4 sm:p-7 shadow-card"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="users" className="h-6 w-6"/></span><h3 className="mt-5 text-lg font-bold text-gray-900">{text(blocks, "h3.strengthen-communities", "Strengthen Communities")}</h3><p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.create-partnerships-that-promote-lifelong", "Create partnerships that promote lifelong learning and innovation.")}</p></div>
              </div>
            </div>
          </section>

          {/* Impact (counters) */}
          <section id="impact" className="surface-brand py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200"><Icon name="bar-chart-2" className="h-4 w-4"/> Community Impact</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.building-stronger-stem-communities", "Building stronger STEM communities")}</h2>
              </div>
              <dl className="sr-stagger mt-9 grid grid-cols-2 gap-6 text-center md:grid-cols-3 lg:grid-cols-5">
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="5000" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Community Members Reached</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="100" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Outreach Events</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="80" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Schools &amp; Partners</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="300" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Volunteers Engaged</dd></div>
                <div className="sr-fade-up rounded-2xl bg-white/10 p-6 ring-1 ring-white/15"><dt className="counter text-3xl font-bold tabular-nums sm:text-4xl" data-target="15" data-suffix="+">0+</dt><dd className="mt-2 text-sm text-orange-100">Districts Served</dd></div>
              </dl>
            </div>
          </section>

          {/* Gallery */}
          <section className="py-12 md:py-14">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="image" className="h-4 w-4"/> Community Gallery</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.moments-from-the-field", "Moments from the field")}</h2>
              </div>
              <div className="sr-stagger mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                <img src="/images/catapilar.jpeg" alt="Science experiments" className="h-36 w-full rounded-lg object-cover sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/robot.jpeg" alt="Robotics workshop" className="h-36 w-full rounded-lg object-cover sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/plane.jpg" alt="Drone demonstration" className="h-36 w-full rounded-lg object-cover sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/inspect.jpeg" alt="Engineering challenge" className="h-36 w-full rounded-lg object-cover sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/1713891129693.jpeg" alt="Students presenting projects" className="h-36 w-full rounded-lg object-cover object-top sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/teachers.jpeg" alt="Community STEM festival" className="h-36 w-full rounded-lg object-cover sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/1718038140753.jpeg" alt="Volunteer engagement" className="h-36 w-full rounded-lg object-cover object-top sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
                <img src="/images/185A1601-scaled.jpg" alt="Award ceremony" className="h-36 w-full rounded-lg object-cover sm:h-44" width="400" height="264" loading="lazy" decoding="async"/>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="message-circle" className="h-4 w-4"/> Voices from Our Community</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.what-people-are-saying", "What people are saying")}</h2>
              </div>
              <div className="sr-stagger mt-9 grid gap-6 lg:grid-cols-3">
                <figure className="sr-fade-up rounded-2xl bg-white p-8 shadow-card"><Icon name="star" className="h-6 w-6 text-orange-700"/><blockquote className="mt-4 text-base leading-7 text-gray-800">&quot;The outreach program transformed how our students think about science. They were engaged, curious, and excited to learn.&quot;</blockquote><figcaption className="mt-4 text-sm font-semibold text-orange-700">School Administrator</figcaption></figure>
                <figure className="sr-fade-up rounded-2xl bg-white p-8 shadow-card"><Icon name="star" className="h-6 w-6 text-orange-700"/><blockquote className="mt-4 text-base leading-7 text-gray-800">&quot;This was my first time seeing a drone and building a robot. Now I want to become an engineer.&quot;</blockquote><figcaption className="mt-4 text-sm font-semibold text-orange-700">Student Participant</figcaption></figure>
                <figure className="sr-fade-up rounded-2xl bg-white p-8 shadow-card"><Icon name="star" className="h-6 w-6 text-orange-700"/><blockquote className="mt-4 text-base leading-7 text-gray-800">&quot;The hands-on activities inspired our students and showed them that STEM is both exciting and achievable.&quot;</blockquote><figcaption className="mt-4 text-sm font-semibold text-orange-700">Teacher</figcaption></figure>
              </div>
            </div>
          </section>

          {/* Partner + Volunteer */}
          <section className="py-12 md:py-16">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-8">
              <div className="sr-fade-up rounded-2xl bg-white p-8 shadow-card">
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="users" className="h-4 w-4"/> Partner With Us</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{text(blocks, "h2.let-s-expand-stem-together", "Let's expand STEM together")}</h2>
                <p className="mt-4 text-base leading-7 text-gray-600">{text(blocks, "p.we-welcome-partnerships-with-schools", "We welcome partnerships with schools, universities, community organizations, companies, government agencies, and volunteers who share our commitment to expanding STEM education.")}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Schools</span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Universities</span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Industry</span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Government</span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Community Organizations</span>
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-800">Nonprofits</span>
                </div>
                <Link href="/contact" className="mt-7 btn-primary">Become a Partner <Icon name="arrow-right" className="h-4 w-4"/></Link>
              </div>
              <div className="sr-fade-up flex flex-col justify-center rounded-2xl surface-brand p-8">
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-200"><Icon name="user-plus" className="h-4 w-4"/> Volunteer With Us</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{text(blocks, "h2.help-inspire-the-next-generation", "Help inspire the next generation")}</h2>
                <p className="mt-4 text-base leading-7 text-orange-100">{text(blocks, "p.engineers-scientists-educators-university-students", "Engineers, scientists, educators, university students, and STEM professionals can make a meaningful impact by sharing their knowledge and inspiring future innovators.")}</p>
                <Link href="/volunteers" className="mt-7 self-start btn-on-brand">Become a Volunteer <Icon name="arrow-right" className="h-4 w-4"/></Link>
              </div>
            </div>
          </section>

          {/* STEM pipeline */}
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="sr-fade-up inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-700"><Icon name="git-branch" className="h-4 w-4"/> Building the STEM Pipeline</p>
                <h2 className="sr-fade-up mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{text(blocks, "h2.part-of-one-connected-pathway", "Part of one connected pathway")}</h2>
              </div>
              <ol className="sr-stagger mx-auto mt-9 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="smile" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.youth-stem-school", "Youth STEM School")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-orange-500 p-5 text-center text-white"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/25"><Icon name="globe" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold">{text(blocks, "p.community-outreach", "Community Outreach")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="book-open" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.secondary-research", "Secondary Research")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="award" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.scholarships", "Scholarships")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="search" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.university-research", "University Research")}</p></li>
                <li className="sr-fade-up flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-card"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700"><Icon name="trending-up" className="h-5 w-5"/></span><p className="mt-3 text-sm font-semibold text-gray-900">{text(blocks, "p.careers-leadership", "Careers & Leadership")}</p></li>
              </ol>
            </div>
          </section>

          {/* Final CTA */}
          <section className="surface-brand py-14">
            <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
              <h2 className="sr-fade-up text-3xl font-bold tracking-tight sm:text-4xl">{text(blocks, "h2.ready-to-bring-stem-to", "Ready to bring STEM to your community?")}</h2>
              <p className="sr-fade-up mx-auto mt-5 max-w-2xl text-base leading-7 text-orange-100">{text(blocks, "p.together-we-can-inspire-curiosity", "Together, we can inspire curiosity, create opportunities, and prepare the next generation of STEM leaders. We work with schools, community organizations, local governments, and corporate partners to deliver engaging STEM experiences tailored to your audience.")}</p>
              <div className="sr-fade-up mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-on-brand">Request an Outreach Event</Link>
                <Link href="/contact" className="btn-outline-on-brand">Become a Partner</Link>
                <Link href="/donate" className="btn-outline-on-brand">Support Our Mission</Link>
              </div>
            </div>
          </section>

        </main>
    </>
  );
}
