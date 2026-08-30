import Link from 'next/link';
import { text } from '@/lib/blocks';
import FeatureIcon from '@/components/FeatureIcon';
import Icon from '@/components/Icon';

export default function ImpactContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
        <main>
          {/* Intro */}
          <section className="bg-cream-100">
            <div className="mx-auto grid max-w-6xl items-center gap-9 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
              <div className="text-center md:text-left">
                <h1 className="sr-fade-up text-4xl">{text(blocks, "h1.measuring-progress-toward-a-future", "Measuring progress toward a future where more students can access STEM opportunity.")}</h1>
                <p className="sr-fade-up mt-8 text-lg leading-8 text-gray-600">{text(blocks, "p.our-impact-is-measured-not", "Our impact is measured not only by numbers, but by the students who gain access, confidence, mentorship, and a clearer path toward STEM education and careers.")}</p>
              </div>
              <div className="sr-fade-up grid grid-cols-2 gap-3" aria-label="STEM program highlights">
                <div className="overflow-hidden rounded-lg shadow-card">
                  <img src="/images/185A1601-scaled.jpg" alt="Students in a community STEM gathering" className="aspect-[4/3] h-full w-full object-cover object-top" width="400" height="300" loading="lazy" decoding="async"/>
                </div>
                <div className="overflow-hidden rounded-lg shadow-card">
                  <img src="/images/robot.jpeg" alt="Students working on a robotics project" className="aspect-[4/3] h-full w-full object-cover" width="400" height="300" loading="lazy" decoding="async"/>
                </div>
                <div className="col-span-2 overflow-hidden rounded-lg shadow-card">
                  <img src="/images/plane.jpg" alt="Student-built STEM model vehicle" className="aspect-[21/9] w-full object-cover" width="800" height="340" loading="lazy" decoding="async"/>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Snapshot */}
          <section className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl text-center md:text-left">
                <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.impact-snapshot", "Impact Snapshot")}</p>
                <h2 className="sr-fade-up mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{text(blocks, "h2.early-progress-real-students-and", "Early progress, real students, and growing momentum")}</h2>
                <p className="sr-fade-up mt-6 text-base leading-7 text-gray-600">{text(blocks, "p.these-figures-should-be-updated", "These figures should be updated regularly as programs expand. Even at an early stage, clear reporting helps donors, partners, and grant reviewers understand what has already begun.")}</p>
              </div>

              <div className="sr-fade-up mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Program photography">
                <div className="overflow-hidden rounded-lg shadow-card">
                  <img src="/images/teachers.jpeg" alt="Educators supporting students in STEM learning" className="h-40 w-full object-cover sm:h-44" width="600" height="400" loading="lazy" decoding="async"/>
                </div>
                <div className="overflow-hidden rounded-lg shadow-card">
                  <img src="/images/1718038140753.jpeg" alt="Students presenting science fair projects" className="h-40 w-full object-cover sm:h-44" width="600" height="400" loading="lazy" decoding="async"/>
                </div>
                <div className="overflow-hidden rounded-lg shadow-card">
                  <img src="/images/catapilar.jpeg" alt="Hands-on STEM workshop activity" className="h-40 w-full object-cover sm:h-44" width="600" height="400" loading="lazy" decoding="async"/>
                </div>
              </div>

              <div className="sr-stagger mt-9 grid grid-cols-2 gap-x-10 gap-y-12 pt-9 sm:gap-x-12 xl:grid-cols-4">
                <div className="sr-fade-up">
                  <FeatureIcon name="people" className="feature-ico" />
                  <p className="mt-5 text-4xl font-bold tracking-tight text-orange-700 sm:text-5xl">25+</p>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">{text(blocks, "h3.students-supported", "Students Supported")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.students-reached-through-scholarships-guidance", "Students reached through scholarships, guidance, mentorship, or STEM focused support.")}</p>
                </div>
                <div className="sr-fade-up">
                  <FeatureIcon name="award" className="feature-ico" />
                  <p className="mt-5 text-4xl font-bold tracking-tight text-orange-700 sm:text-5xl">3+</p>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">{text(blocks, "h3.scholarships-awarded", "Scholarships Awarded")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.scholarship-support-provided-to-students", "Scholarship support provided to students pursuing education in STEM related fields.")}</p>
                </div>
                <div className="sr-fade-up">
                  <FeatureIcon name="layers" className="feature-ico" />
                  <p className="mt-5 text-4xl font-bold tracking-tight text-orange-700 sm:text-5xl">2+</p>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">{text(blocks, "h3.active-initiatives", "Active Initiatives")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.ongoing-efforts-focused-on-scholarships", "Ongoing efforts focused on scholarships, mentorship, and student opportunity building.")}</p>
                </div>
                <div className="sr-fade-up">
                  <FeatureIcon name="place" className="feature-ico" />
                  <p className="mt-5 text-4xl font-bold tracking-tight text-orange-700 sm:text-5xl">Uganda</p>
                  <h3 className="mt-3 text-base font-semibold text-gray-900">{text(blocks, "h3.primary-area-of-operation", "Primary Area of Operation")}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{text(blocks, "p.current-work-is-focused-on", "Current work is focused on expanding access for underserved students in Uganda.")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Story — headline leads the section, images sit in a staggered
               pair, and the quote is pulled out full width as the closing beat. */}
          <section className="relative overflow-hidden bg-cream-100 py-14 md:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <header className="sr-fade-up max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.impact-story", "Impact Story")}</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">{text(blocks, "h2.behind-every-number-is-a", "Behind every number is a student with potential.")}</h2>
              </header>

              <div className="mt-10 grid gap-9 pt-10 lg:grid-cols-12 lg:gap-16">
                {/* Staggered image pair — the offset column is what stops this
                     reading as a plain grid. */}
                <div className="sr-fade-up grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-6">
                  <div className="overflow-hidden rounded-lg">
                    <img src="/images/catapilar.jpeg" alt="Students standing behind cardboard model vehicles and an automatic rubbish collector project at a school science fair" className="aspect-[4/3] w-full object-cover" width="2048" height="1365" loading="lazy" decoding="async"/>
                  </div>
                  <div className="space-y-3 sm:space-y-4 lg:pt-10">
                    <div className="overflow-hidden rounded-lg">
                      <img src="/images/1713891129693.jpeg" alt="Students in school uniforms photographed with a school chaplain and a staff member" className="aspect-[4/3] w-full object-cover" width="2048" height="1365" loading="lazy" decoding="async"/>
                    </div>
                    <div className="overflow-hidden rounded-lg">
                      <img src="/images/about-3-scaled.jpg" alt="Students engaged in collaborative learning" className="aspect-[4/3] w-full object-cover" width="2560" height="1707" loading="lazy" decoding="async"/>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="space-y-6 text-base leading-8 text-gray-600">
                    <p className="sr-fade-up">{text(blocks, "p.one-of-the-foundations-early", "One of the foundation’s early priorities has been helping students pursue STEM pathways that may otherwise feel out of reach because of financial barriers, limited exposure, or lack of guidance.")}</p>
                    <p className="sr-fade-up">{text(blocks, "p.through-scholarship-support-and-mentorship", "Through scholarship support and mentorship, students receive more than financial assistance. They receive encouragement, direction, and a reminder that their goals are possible.")}</p>
                    <p className="sr-fade-up">{text(blocks, "p.for-students-pursuing-fields-such", "For students pursuing fields such as engineering, science, and technology, this support can make the difference between pausing a dream and continuing toward a career with long term impact.")}</p>
                  </div>
                </div>
              </div>

              {/* Quote pulled full width as the closing beat rather than tucked at
                   the end of the text column. */}
              <figure className="sr-fade-up mt-9 pt-9 text-center">
                <Icon name="message-circle" className="mx-auto h-8 w-8 text-orange-500"/>
                <blockquote className="mx-auto mt-6 max-w-4xl text-2xl font-bold leading-snug tracking-tight text-gray-900 sm:text-3xl sm:leading-snug">
                  &ldquo;We are not just supporting students. We are helping build future engineers, scientists, and innovators.&rdquo;
                </blockquote>
              </figure>
            </div>
          </section>

          {/* What We Measure */}
          <section className="surface-brand py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="sr-fade-up text-center md:text-left text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">{text(blocks, "p.what-we-measure", "What We Measure")}</p>
                  <h2 className="sr-fade-up mt-4 text-center md:text-left text-2xl font-bold tracking-tight sm:text-3xl">{text(blocks, "h2.we-track-outcomes-that-show", "We track outcomes that show whether students are moving forward.")}</h2>
                  <p className="sr-fade-up mt-6 text-center md:text-left text-base leading-7 text-orange-100">{text(blocks, "p.our-work-is-strongest-when", "Our work is strongest when it can be measured. As programs grow, we will continue tracking both quantitative and qualitative indicators of student progress.")}</p>
                  <div className="sr-fade-up mt-8 grid grid-cols-2 gap-3">
                    <div className="overflow-hidden rounded-lg ring-1 ring-white/20">
                      <img src="/images/IMG_8893.jpg" alt="Robotics program in action" className="aspect-[4/3] w-full object-cover" width="400" height="300" loading="lazy" decoding="async"/>
                    </div>
                    <div className="overflow-hidden rounded-lg ring-1 ring-white/20">
                      <img src="/images/team/prof.jpeg" alt="Aerospace education activity" className="aspect-[4/3] w-full object-cover" width="400" height="300" loading="lazy" decoding="async"/>
                    </div>
                  </div>
                </div>

                <div className="sr-stagger grid gap-x-10 gap-y-10 pt-10 sm:grid-cols-2">
                  <div className="sr-fade-up">
                    <FeatureIcon name="book" className="feature-ico mb-4" />
                    <h3 className="text-lg font-semibold">{text(blocks, "h3.access-to-education", "Access to Education")}</h3>
                    <p className="mt-3 text-sm leading-6 text-orange-100">{text(blocks, "p.students-receive-support-that-helps", "Students receive support that helps reduce financial barriers and makes STEM education more reachable.")}</p>
                  </div>
                  <div className="sr-fade-up">
                    <FeatureIcon name="growth" className="feature-ico mb-4" />
                    <h3 className="text-lg font-semibold">{text(blocks, "h3.increased-confidence", "Increased Confidence")}</h3>
                    <p className="mt-3 text-sm leading-6 text-orange-100">{text(blocks, "p.mentorship-and-exposure-help-students", "Mentorship and exposure help students see themselves as future engineers, scientists, researchers, and innovators.")}</p>
                  </div>
                  <div className="sr-fade-up">
                    <FeatureIcon name="compass" className="feature-ico mb-4" />
                    <h3 className="text-lg font-semibold">{text(blocks, "h3.career-direction", "Career Direction")}</h3>
                    <p className="mt-3 text-sm leading-6 text-orange-100">{text(blocks, "p.guidance-helps-students-understand-academic", "Guidance helps students understand academic pathways, professional options, and the steps needed to pursue STEM careers.")}</p>
                  </div>
                  <div className="sr-fade-up">
                    <FeatureIcon name="innovation" className="feature-ico mb-4" />
                    <h3 className="text-lg font-semibold">{text(blocks, "h3.innovation-mindset", "Innovation Mindset")}</h3>
                    <p className="mt-3 text-sm leading-6 text-orange-100">{text(blocks, "p.students-are-encouraged-to-think", "Students are encouraged to think beyond the classroom and apply STEM knowledge to real community challenges.")}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Evidence of Activity */}
          <section className="bg-white py-12 md:py-14">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
                <header className="sr-fade-up lg:col-span-4 lg:sticky lg:top-24 text-center md:text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.evidence-of-activity", "Evidence of Activity")}</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{text(blocks, "h2.impact-grows-through-consistent-visible", "Impact grows through consistent, visible action.")}</h2>
                  <p className="mt-4 text-base leading-relaxed text-stone-600">{text(blocks, "p.from-scholarships-and-mentorship-to", "From scholarships and mentorship to hands-on STEM learning, our programs create progress students and partners can see and measure.")}</p>
                  <p className="mt-6 rounded-xl bg-cream-200 px-4 py-3 text-sm leading-relaxed text-stone-700">{text(blocks, "p.each-area-below-reflects-work", "Each area below reflects work already underway — not future plans — as we build toward broader reach across Uganda.")}</p>
                </header>

                <div className="sr-stagger mt-10 space-y-4 lg:col-span-8 lg:mt-0">
                  <article className="sr-fade-up flex gap-4 bg-cream-100 p-5 sm:gap-5 sm:p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-orange-500 text-white" aria-hidden="true">
                      <Icon name="award" className="h-5 w-5"/>
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{text(blocks, "h3.scholarship-support", "Scholarship support")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.financial-assistance-for-stem-focused", "Financial assistance for STEM-focused students covering tuition, materials, and related costs so education stays within reach.")}</p>
                    </div>
                  </article>
                  <article className="sr-fade-up flex gap-4 bg-cream-100 p-5 sm:gap-5 sm:p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-orange-500 text-white" aria-hidden="true">
                      <Icon name="users" className="h-5 w-5"/>
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{text(blocks, "h3.mentorship-guidance", "Mentorship & guidance")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.one-on-one-and-group", "One-on-one and group mentorship connecting underserved learners with educators and professionals who help shape their academic path.")}</p>
                    </div>
                  </article>
                  <article className="sr-fade-up flex gap-4 bg-cream-100 p-5 sm:gap-5 sm:p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-orange-500 text-white" aria-hidden="true">
                      <Icon name="cpu" className="h-5 w-5"/>
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{text(blocks, "h3.engineering-science-pathways", "Engineering & science pathways")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.targeted-support-for-students-pursuing", "Targeted support for students pursuing engineering, science, and technology — from coursework guidance to exposure to real-world STEM work.")}</p>
                    </div>
                  </article>
                  <article className="sr-fade-up flex gap-4 bg-cream-100 p-5 sm:gap-5 sm:p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-orange-500 text-white" aria-hidden="true">
                      <Icon name="globe" className="h-5 w-5"/>
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">{text(blocks, "h3.partnerships-outreach", "Partnerships & outreach")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{text(blocks, "p.early-stage-collaborations-with-schools", "Early-stage collaborations with schools, communities, and organizations across Uganda to expand access and bring STEM opportunity to more students.")}</p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* Looking Ahead */}
          <section className="bg-white py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl text-center md:text-left">
                <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.looking-ahead", "Looking Ahead")}</p>
                <h2 className="sr-fade-up mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{text(blocks, "h2.our-next-phase-is-focused", "Our next phase is focused on scale, structure, and stronger measurement.")}</h2>
                <p className="sr-fade-up mt-6 text-base leading-7 text-gray-600">{text(blocks, "p.as-the-foundation-grows-we", "As the foundation grows, we aim to expand the number of students reached while strengthening the systems used to track outcomes, report progress, and sustain long term impact.")}</p>
              </div>

              <div className="sr-stagger mt-9 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                <div className="sr-fade-up">
                  <FeatureIcon name="award" className="feature-ico mb-4" />
                  <p className="text-sm font-semibold leading-6 text-gray-900">{text(blocks, "p.expand-scholarship-support-for-more", "Expand scholarship support for more STEM students")}</p>
                </div>
                <div className="sr-fade-up">
                  <FeatureIcon name="people" className="feature-ico mb-4" />
                  <p className="text-sm font-semibold leading-6 text-gray-900">{text(blocks, "p.develop-structured-mentorship-cohorts", "Develop structured mentorship cohorts")}</p>
                </div>
                <div className="sr-fade-up">
                  <FeatureIcon name="tools" className="feature-ico mb-4" />
                  <p className="text-sm font-semibold leading-6 text-gray-900">{text(blocks, "p.launch-more-hands-on-stem", "Launch more hands on STEM learning activities")}</p>
                </div>
                <div className="sr-fade-up">
                  <FeatureIcon name="work" className="feature-ico mb-4" />
                  <p className="text-sm font-semibold leading-6 text-gray-900">{text(blocks, "p.build-stronger-partnerships-with-schools", "Build stronger partnerships with schools, universities, and community organizations")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-14">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
              <p className="sr-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">{text(blocks, "p.support-the-impact", "Support the Impact")}</p>
              <h2 className="sr-fade-up mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">{text(blocks, "h2.help-more-students-move-from", "Help more students move from potential to opportunity.")}</h2>
              <p className="sr-fade-up mx-auto mt-6 max-w-3xl text-base leading-7 text-gray-600">{text(blocks, "p.your-support-helps-expand-scholarships", "Your support helps expand scholarships, mentorship, STEM training, and innovation opportunities for underserved students in Uganda.")}</p>
              <div className="sr-fade-up mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/donate" className="btn-primary">
                  <Icon name="heart" className="h-4 w-4"/>
                  {' '}Support Our Work
                </Link>
                <Link href="/contact" className="btn-ghost">
                  <Icon name="users" className="h-4 w-4 text-orange-700"/>
                  {' '}Partner With Us
                </Link>
              </div>
            </div>
          </section>
        </main>
    </>
  );
}
