'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import Logo from './Logo';
import MegaIcon from './MegaIcon';

/**
 * Site navigation.
 *
 * A cream bar that is opaque from the top — on a cream page there is nothing
 * for a translucent header to sit over — and picks up a hairline plus a soft
 * shadow once the page scrolls. Desktop mega panels open on hover/focus with a
 * short grace period so the pointer can cross the gap into them; the mobile menu
 * is a full-screen overlay that locks body scroll.
 */

type MegaKey = 'about' | 'programs' | 'resources';

// Grace period so the pointer can travel from a trigger into its panel (they
// are not adjacent in the DOM) without the menu snapping shut.
const CLOSE_DELAY_MS = 180;

export type MegaFeature = {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  cta: string;
};

/**
 * `features` comes from the site layout, which reads the CMS. The header is a
 * client component — it manages hover, focus and the mobile drawer — so it
 * cannot fetch; the newest story and issue are handed to it instead. Absent
 * data simply means the panel shows its links and nothing else, which is the
 * right behaviour before anything has been published.
 */
export default function Header({ features = [] }: { features?: MegaFeature[] }) {
  const [openMega, setOpenMega] = useState<MegaKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openAcc, setOpenAcc] = useState<MegaKey | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const showMega = useCallback(
    (key: MegaKey) => {
      cancelClose();
      setOpenMega(key);
    },
    [cancelClose],
  );

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMega(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  // Solid bar once scrolled past the hero's top, or while the mobile menu is up.
  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);

  // Any scroll closes an open mega panel.
  useEffect(() => {
    if (!openMega) return;
    const close = () => setOpenMega(null);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [openMega]);

  // Outside click, Escape, and tab-out all dismiss.
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMega(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenMega(null);
      setMobileOpen(false);
    };
    const onFocusIn = (e: FocusEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMega(null);
    };
    document.addEventListener('click', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('click', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, []);

  // Lock the page behind the full-screen mobile overlay.
  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', mobileOpen);
    return () => document.body.classList.remove('overflow-hidden');
  }, [mobileOpen]);

  const isSolid = scrolled || mobileOpen;

  const megaBtnProps = (key: MegaKey) => ({
    type: 'button' as const,
    className: `nav-link nav-mega-btn${openMega === key ? ' is-active' : ''}`,
    'aria-expanded': openMega === key,
    'aria-haspopup': true,
    onMouseEnter: () => showMega(key),
    onMouseLeave: scheduleClose,
    onFocus: () => showMega(key),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenMega((current) => (current === key ? null : key));
    },
  });

  const panelProps = (key: MegaKey) => ({
    className: `mega-panel hidden lg:block${openMega === key ? ' is-open' : ''}`,
    role: 'region',
    onMouseEnter: cancelClose,
    onMouseLeave: scheduleClose,
  });

  return (
    <nav
      ref={navRef}
      id="site-nav"
      className={`site-nav fixed inset-x-0 top-0 z-50 w-full transition-shadow duration-300${
        isSolid ? ' is-scrolled' : ''
      }${openMega ? ' is-mega-open' : ''}`}
    >
      <div className="container-page relative z-50 flex h-[5.5rem] items-center justify-between gap-4 md:h-24">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Jdiobe STEM Foundation — home"
        >
          <Logo className="h-7 w-auto text-charcoal-800 sm:h-8 md:h-9" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex lg:gap-7">
          <button {...megaBtnProps('programs')}>
            <span>Programs</span>
            <Icon name="chevron-down" className="nav-caret h-4 w-4" />
          </button>

          <button {...megaBtnProps('about')}>
            <span>About Us</span>
            <Icon name="chevron-down" className="nav-caret h-4 w-4" />
          </button>

          <button {...megaBtnProps('resources')}>
            <span>Resources</span>
            <Icon name="chevron-down" className="nav-caret h-4 w-4" />
          </button>
          <Link href="/contact" className="nav-link">
            <span>Contact</span>
          </Link>
          <Link href="/donate" className="btn-primary ml-1 !py-2.5 !text-[0.9375rem]">
            <span>Donate</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/donate" className="btn-primary hidden !px-5 !py-2.5 !text-sm sm:inline-flex">
            <span>Donate</span>
          </Link>
          <button
            id="menu-btn"
            type="button"
            className="hamburger-btn relative z-50 -mr-2 flex h-11 w-11 items-center justify-center focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="hamburger-line hamburger-line-1"></span>
            <span className="hamburger-line hamburger-line-2"></span>
            <span className="hamburger-line hamburger-line-3"></span>
          </button>
        </div>
      </div>

      {/* ===================== MEGA PANELS (desktop only) =====================
          Full-bleed, same brand orange as the solid nav, anchored to the nav's
          bottom edge with no gap or border — opening one also forces the nav
          solid, so bar + panel read as a single continuous surface. */}
      <div {...panelProps('resources')} aria-label="Resources menu">
        <div className="mega-inner container-page grid gap-10 py-10 lg:grid-cols-12 lg:gap-12">
          <div className="mega-col lg:col-span-4">
            <p className="mega-heading">Read</p>
            <Link href="/news" className="mega-link">
              <MegaIcon name="news-updates" className="mega-ico" />
              <span>News &amp; Updates</span>
            </Link>
            <Link href="/magazine" className="mega-link">
              <MegaIcon name="magazine" className="mega-ico" />
              <span>STEM Bridge Magazine</span>
            </Link>
            <Link href="/newsletters" className="mega-link">
              <MegaIcon name="news-updates" className="mega-ico" />
              <span>Newsletter publications</span>
            </Link>
          </div>

          {features.length > 0 ? (
            <div className="mega-col lg:col-span-8">
              <p className="mega-heading">Latest</p>
              <div className="grid gap-6 sm:grid-cols-2">
                {features.map((f) => (
                  <Link key={f.href} href={f.href} className="mega-feature group">
                    {f.image ? (
                      <img
                        src={f.image}
                        alt=""
                        className="mega-feature-img"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <span className="mega-feature-body">
                      <span className="mega-feature-eyebrow">{f.eyebrow}</span>
                      <span className="mega-feature-title">{f.title}</span>
                      <span className="mega-feature-text">{f.text}</span>
                      <span className="mega-feature-cta">
                        {f.cta} <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div {...panelProps('about')} aria-label="About menu">
        <div className="mega-inner container-page grid gap-10 py-10 lg:grid-cols-12 lg:gap-12">
          <div className="mega-col lg:col-span-3">
            <p className="mega-heading">The Foundation</p>
            <Link href="/about" className="mega-link">
              <MegaIcon name="about-us" className="mega-ico" />
              <span>About Us</span>
            </Link>
            <Link href="/team" className="mega-link">
              <MegaIcon name="our-team" className="mega-ico" />
              <span>Our Team</span>
            </Link>
            <Link href="/impact" className="mega-link">
              <MegaIcon name="our-impact" className="mega-ico" />
              <span>Our Impact</span>
            </Link>
          </div>

          <div className="mega-col lg:col-span-3">
            <p className="mega-heading">Get Involved</p>
            <Link href="/volunteers" className="mega-link">
              <MegaIcon name="volunteers" className="mega-ico" />
              <span>Volunteers</span>
            </Link>
            <Link href="/contact" className="mega-link">
              <MegaIcon name="contact-us" className="mega-ico" />
              <span>Contact Us</span>
            </Link>
          </div>

          <div className="mega-col lg:col-span-6">
            <Link href="/donate" className="mega-feature group">
              <img
                src="/images/hero-students-community.png"
                alt=""
                className="mega-feature-img"
                loading="lazy"
                decoding="async"
              />
              <span className="mega-feature-body">
                <span className="mega-feature-eyebrow">Support our work</span>
                <span className="mega-feature-title">Sponsor a student today</span>
                <span className="mega-feature-text">
                  Tuition, materials, and mentorship for students with the ambition but not the
                  access.
                </span>
                <span className="mega-feature-cta">
                  Donate <Icon name="arrow-right" className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div {...panelProps('programs')} aria-label="Programs menu">
        <div className="mega-inner container-page grid gap-10 py-10 lg:grid-cols-12 lg:gap-12">
          <div className="mega-col lg:col-span-3">
            <p className="mega-heading">Our Programs</p>
            <Link href="/programs" className="mega-link">
              <MegaIcon name="all-programs" className="mega-ico" />
              <span>All Programs</span>
            </Link>
            <Link href="/scholarship" className="mega-link">
              <MegaIcon name="scholarships" className="mega-ico" />
              <span>Scholarships</span>
            </Link>
            <Link href="/youth-stem" className="mega-link">
              <MegaIcon name="youth-stem" className="mega-ico" />
              <span>Youth STEM</span>
            </Link>
            <Link href="/aerospace-institute" className="mega-link">
              <MegaIcon name="aerospace-institute" className="mega-ico" />
              <span>Aerospace Institute</span>
            </Link>
          </div>

          <div className="mega-col lg:col-span-3">
            <p className="mega-heading">Initiatives</p>
            <Link href="/community-outreach" className="mega-link">
              <MegaIcon name="community-outreach" className="mega-ico" />
              <span>Community Outreach</span>
            </Link>
            <Link href="/secondary-research" className="mega-link">
              <MegaIcon name="research" className="mega-ico" />
              <span>Secondary Research</span>
            </Link>
            <Link href="/mentorship" className="mega-link">
              <MegaIcon name="volunteers" className="mega-ico" />
              <span>Mentorship</span>
            </Link>
          </div>

          <div className="mega-col lg:col-span-6">
            <p className="mega-heading">Areas of Operation</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/uganda" className="mega-place group">
                <img
                  src="/images/hero-science-fair-projects.png"
                  alt=""
                  className="mega-place-img"
                  loading="lazy"
                  decoding="async"
                />
                <span className="mega-place-body">
                  <span className="mega-place-title">
                    <Icon name="map-pin" className="h-4 w-4" />
                    Uganda
                  </span>
                  <span className="mega-place-text">
                    Scholarships, hands-on STEM, and student-led innovation.
                  </span>
                </span>
              </Link>
              <Link href="/south-sudan" className="mega-place group">
                <img
                  src="/images/185A1601-scaled.jpg"
                  alt=""
                  className="mega-place-img"
                  loading="lazy"
                  decoding="async"
                />
                <span className="mega-place-body">
                  <span className="mega-place-title">
                    <Icon name="map-pin" className="h-4 w-4" />
                    South Sudan
                  </span>
                  <span className="mega-place-text">
                    Teacher training, equipment access, and mentorship.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu fixed inset-0 z-40 flex flex-col overflow-y-auto px-6 pb-10 pt-28 lg:hidden${
          mobileOpen ? ' is-open' : ''
        }`}
      >
        <div className="flex flex-1 flex-col justify-center gap-1">
          <MobileAccordion
            id="about"
            icon="info"
            label="About Us"
            open={openAcc === 'about'}
            onToggle={() => setOpenAcc((k) => (k === 'about' ? null : 'about'))}
          >
            {[
              ['/about', 'About Us'],
              ['/team', 'Our Team'],
              ['/impact', 'Our Impact'],
              ['/volunteers', 'Volunteers'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block py-2.5 text-base text-charcoal-600 transition hover:text-orange-600"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </MobileAccordion>

          <MobileAccordion
            id="programs"
            icon="layers"
            label="Programs"
            open={openAcc === 'programs'}
            onToggle={() => setOpenAcc((k) => (k === 'programs' ? null : 'programs'))}
          >
            {[
              ['/programs', 'All Programs'],
              ['/scholarship', 'Scholarships'],
              ['/youth-stem', 'Youth STEM'],
              ['/aerospace-institute', 'Aerospace Institute'],
              ['/community-outreach', 'Community Outreach'],
              ['/secondary-research', 'Secondary Research'],
              ['/mentorship', 'Mentorship'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block py-2.5 text-base text-charcoal-600 transition hover:text-orange-600"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <p className="pb-1 pt-4 text-xs font-extrabold uppercase tracking-[0.15em] text-charcoal-400">
              Areas of Operation
            </p>
            {[
              ['/uganda', 'Uganda'],
              ['/south-sudan', 'South Sudan'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block py-2.5 text-base text-charcoal-600 transition hover:text-orange-600"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </MobileAccordion>

          <MobileAccordion
            id="resources"
            icon="book-open"
            label="Resources"
            open={openAcc === 'resources'}
            onToggle={() => setOpenAcc((k) => (k === 'resources' ? null : 'resources'))}
          >
            {[
              ['/news', 'News & Updates'],
              ['/magazine', 'STEM Bridge Magazine'],
              ['/newsletters', 'Newsletter publications'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block py-2.5 text-base text-charcoal-600 transition hover:text-orange-600"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </MobileAccordion>

          {[
            ['/contact', 'Contact'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="nav-link-mobile py-4 text-lg transition hover:text-orange-600"
              onClick={() => setMobileOpen(false)}
            >
              <span>{label}</span>
            </Link>
          ))}

          <Link
            href="/donate"
            className="btn-primary mt-8 w-full !py-3.5 !text-base"
            onClick={() => setMobileOpen(false)}
          >
            <span>Donate</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function MobileAccordion({
  id,
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mobile-acc">
      <button
        type="button"
        className="mobile-acc-btn nav-link-mobile w-full py-4 text-lg transition hover:text-orange-600"
        aria-expanded={open}
        aria-controls={`mobile-acc-${id}`}
        onClick={onToggle}
      >
        <span className="flex-1 text-left">{label}</span>
        <Icon
          name="chevron-down"
          className={`mobile-acc-caret h-5 w-5 transition-transform${open ? ' rotate-180' : ''}`}
        />
      </button>
      <div id={`mobile-acc-${id}`} className={`mobile-acc-panel pb-3 pl-8${open ? '' : ' hidden'}`}>
        {children}
      </div>
    </div>
  );
}
