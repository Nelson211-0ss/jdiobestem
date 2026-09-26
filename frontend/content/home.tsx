import Link from 'next/link';
import type { SiteStat, SiteStory } from '@/lib/site-content';
import HeroSection from '@/components/HeroSection';
import PartnerMarquee from '@/components/PartnerMarquee';
import Icon from '@/components/Icon';

const programs = [
  { number: '01', title: 'Scholarships', image: '/images/moses-nambiro.png', alt: 'Scholarship recipient Moses Nambiro', description: 'Practical support for tuition, materials, and travel, so students can take their next step.', href: '/scholarship', cta: 'Explore scholarships', contain: true },
  { number: '02', title: 'Hands-on STEM', image: '/images/hero-science-fair-projects.png', alt: 'Students demonstrating electronics and solar projects at a science fair', description: 'From a first experiment to the Science Fair. Turn classroom ideas into projects that solve problems.', href: '/secondary-research', cta: 'Discover the Science Fair', contain: false },
  { number: '03', title: 'Mentorship', image: '/images/inspect.jpeg', alt: 'Students and visitors discussing projects at a STEM exhibition', description: 'Connect with educators and professionals to explore what comes next in science and engineering.', href: '/mentorship', cta: 'Explore mentorship', contain: false },
];

export default function HomeContent({ stats, featuredStory }: { stats: SiteStat[]; featuredStory?: SiteStory }) {
  return (
    <main className="editorial-home">
      <HeroSection />
      {stats.length > 0 && <section id="impact" className="editorial-evidence" aria-label="Foundation at a glance">
        <div className="container-page">
          <div className="editorial-evidence__heading"><p className="eyebrow">Opportunity in numbers</p><Link href="/impact" className="editorial-link">Explore our impact ↗</Link></div>
          <dl>{stats.map(stat => <div key={stat.label}><dt>{stat.value.toLocaleString('en-US')}{stat.suffix}</dt><dd>{stat.label}</dd></div>)}</dl>
        </div>
      </section>}

      <section id="programs" className="editorial-section">
        <div className="container-page">
          <div className="editorial-section__head"><div><p className="eyebrow">What we do</p><h2>Different paths.<br />More possibilities.</h2></div><p className="lede">Talent is everywhere. Access is not. We help students find the support, skills, and people to move forward.</p></div>
          <div className="editorial-programs">{programs.map(program => <article key={program.title} className="editorial-program">
            <Link href={program.href} tabIndex={-1} aria-hidden="true"><img src={program.image} alt="" width="800" height="600" loading="lazy" className={program.contain ? 'portrait' : ''} /></Link>
            <div className="editorial-program__title"><span>{program.number}</span><h3><Link href={program.href}>{program.title}</Link></h3></div>
            <p>{program.description}</p><Link href={program.href} className="editorial-link">{program.cta} <Icon name="arrow-right" /></Link>
          </article>)}</div>
          <div className="editorial-more"><span>More ways to learn</span><Link href="/youth-stem">Youth STEM ↗</Link><Link href="/community-outreach">Community outreach ↗</Link><Link href="/aerospace-institute">Aerospace Institute ↗</Link></div>
        </div>
      </section>

      <section className="editorial-story">
        <div className="container-page editorial-story__grid">
          <figure><img src="/images/moses-nambiro.png" alt="Moses Nambiro, travel scholarship recipient" width="600" height="700" loading="lazy" /><figcaption>Moses Nambiro · Scholarship recipient</figcaption></figure>
          <div><p className="eyebrow">One student. A new possibility.</p><h2>The next step toward a future in flight.</h2><p className="lede">For Moses Nambiro, admission to study Aeronautical Engineering was the beginning. Getting there was the next challenge.</p><p>On April 6, 2026, the Foundation awarded Moses a $1,000 travel scholarship to help cover airfare for his international academic journey.</p><div className="editorial-story__detail"><strong>$1,000</strong><span>Travel scholarship<br />Awarded April 2026</span></div>
          <Link className="editorial-link" href={featuredStory ? `/news/${featuredStory.slug}` : '/scholarship'}>{featuredStory ? 'Read Moses’s story' : 'Learn about our scholarships'} <Icon name="arrow-right" /></Link></div>
        </div>
      </section>

      <section id="ongoing-projects" className="editorial-section">
        <div className="container-page">
          <div className="editorial-section__head"><div><p className="eyebrow">Learning by doing</p><h2>Ideas become something real.</h2></div><p className="lede">Build, test, ask questions, and try again. Hands-on projects give students room to discover what they can do.</p></div>
          <div className="editorial-projects">
            <figure><img src="/images/hero-science-fair-projects.png" alt="Students presenting solar and electronics experiments at an outdoor science fair" width="1920" height="1080" loading="lazy" /><figcaption><strong>A place to share ideas</strong><span>Students present their experiments and explain how they work.</span></figcaption></figure>
            <figure><img src="/images/hero-diy-stem-car.png" alt="A model vehicle assembled from recycled materials, wheels, and a small motor" width="1920" height="1080" loading="lazy" /><figcaption><strong>Engineering from everyday materials</strong><span>A hands-on model brings movement, circuits, and design together.</span></figcaption></figure>
          </div><Link href="/secondary-research" className="editorial-link mt-8">Find your next project <Icon name="arrow-right" /></Link>
        </div>
      </section>

      <section className="editorial-community">
        <div className="container-page"><div className="editorial-partner-heading"><div><p className="eyebrow">Working together</p><h2>Opportunity takes a community.</h2></div><Link href="/contact" className="editorial-link">Become a partner ↗</Link></div><PartnerMarquee />
          <div className="editorial-quote"><blockquote>“Our goal is not only to support students, but to empower them to become leaders and problem solvers in their communities and beyond.”</blockquote><div><img src="/images/muwanika.jpg" alt="" width="64" height="64" loading="lazy" /><p><strong>Dr. Muwanika Jdiobe</strong><span>Founder &amp; Executive Director</span><Link href="/about">Meet the Foundation ↗</Link></p></div></div>
        </div>
      </section>

      <section id="get-involved" className="editorial-invitation"><div className="container-page"><div><p className="eyebrow">Be part of what comes next</p><h2>Help open the next door.</h2><p>Your support helps students access education, mentorship, and practical opportunities in STEM.</p></div><div className="editorial-actions"><Link href="/donate" className="btn-primary">Support a student <Icon name="arrow-right" /></Link><Link href="/contact" className="editorial-link">Partner with us ↗</Link></div></div></section>
    </main>
  );
}
