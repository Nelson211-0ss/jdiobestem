import Link from 'next/link';
import Icon from './Icon';

export default function HeroSection() {
  return (
    <header className="hero-home editorial-hero">
      <div className="container-page editorial-hero__grid">
        <div>
          <p className="eyebrow">Potential deserves opportunity</p>
          <h1>Opening doors for Africa’s next <span>STEM leaders.</span></h1>
          <p className="lede">Scholarships, mentorship, and hands-on learning that help young people turn potential into opportunity.</p>
          <div className="editorial-actions">
            <Link href="/donate" className="btn-primary">Support a student <Icon name="arrow-right" /></Link>
            <a href="#programs" className="editorial-link">Explore our programs <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure className="editorial-hero__photo">
          <img src="/images/hero-students-community.png" alt="Students gathered outside their school, with a student holding a model airplane" width="1920" height="1080" fetchPriority="high" />
          <figcaption><span>Learning together. Going further.</span><span>Jdiobe STEM Foundation</span></figcaption>
        </figure>
      </div>
    </header>
  );
}
