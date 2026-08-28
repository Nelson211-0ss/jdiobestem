'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';

/**
 * Testimonial carousel.
 *
 * One card holds the centre with its neighbours peeking in at the edges, so it
 * is obvious there is more to see without a second row of chrome saying so.
 * Arrows on either side, dots under, keyboard arrows when focused, and a swipe
 * on touch.
 *
 * Every quote here is existing site copy — the outreach and youth-STEM pages
 * already carry these, attributed by role. Nothing is invented, and `source`
 * links each one back to the page it belongs to.
 */

type Quote = {
  quote: string;
  attribution: string;
  context: string;
  source: { href: string; label: string };
};

const QUOTES: Quote[] = [
  {
    quote:
      'The outreach program transformed how our students think about science. They were engaged, curious, and excited to learn.',
    attribution: 'School Administrator',
    context: 'Community STEM Outreach',
    source: { href: '/community-outreach', label: 'About the outreach program' },
  },
  {
    quote:
      'This was my first time seeing a drone and building a robot. Now I want to become an engineer.',
    attribution: 'Student Participant',
    context: 'Community STEM Outreach',
    source: { href: '/community-outreach', label: 'About the outreach program' },
  },
  {
    quote:
      'Our students became much more excited about science after participating.',
    attribution: 'School Head Teacher',
    context: 'Youth STEM School Program',
    source: { href: '/youth-stem', label: 'About the Youth STEM program' },
  },
  {
    quote:
      'Before this program I had never touched a robot. Now I want to become an engineer.',
    attribution: 'Secondary School Student',
    context: 'Youth STEM School Program',
    source: { href: '/youth-stem', label: 'About the Youth STEM program' },
  },
  {
    quote:
      'The hands-on activities inspired our students and showed them that STEM is both exciting and achievable.',
    attribution: 'Teacher',
    context: 'Community STEM Outreach',
    source: { href: '/community-outreach', label: 'About the outreach program' },
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const last = QUOTES.length - 1;

  const go = useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), last)),
    [last]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    }
  };

  // Keep the active card in view for screen readers and tab order.
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (el) el.inert = i !== index;
    });
  }, [index]);

  return (
    <section className="section" aria-labelledby="testimonials-heading">
      <div className="container-page">
        <div className="section-head">
          <p className="eyebrow">In their words</p>
          <h2 id="testimonials-heading">What teachers and students say</h2>
        </div>
      </div>

      <div
        className="testimonial-viewport"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Testimonials"
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          touchStart.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        <button
          type="button"
          className="testimonial-arrow left"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Previous testimonial"
        >
          <Icon name="arrow-left" />
        </button>

        <div className="testimonial-rail">
          <div
            className="testimonial-track"
            /*
             * Cards are --card-w wide and the track is the width of the rail, so a
             * transform percentage here resolves against the rail — which is what
             * makes the arithmetic below simple: shift left by one card per step,
             * then re-centre by half a card.
             */
            style={{ transform: `translateX(calc(50% - var(--card-w) / 2 - ${index} * var(--card-w)))` }}
          >
            {QUOTES.map((q, i) => (
              <div
                key={q.quote}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`testimonial-card${i === index ? ' is-active' : ''}`}
                aria-hidden={i !== index}
              >
                <div className="testimonial-surface">
                  <Icon name="message-circle" className="testimonial-mark" />
                  <blockquote className="testimonial-quote">&ldquo;{q.quote}&rdquo;</blockquote>
                  <p className="testimonial-name">{q.attribution}</p>
                  <p className="testimonial-context">{q.context}</p>
                  <Link href={q.source.href} className="btn-secondary mt-6">
                    {q.source.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="testimonial-arrow right"
          onClick={() => go(index + 1)}
          disabled={index === last}
          aria-label="Next testimonial"
        >
          <Icon name="arrow-right" />
        </button>
      </div>

      <div className="testimonial-dots" role="tablist" aria-label="Choose testimonial">
        {QUOTES.map((q, i) => (
          <button
            key={q.quote}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Testimonial ${i + 1} of ${QUOTES.length}`}
            className={`testimonial-dot${i === index ? ' is-active' : ''}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
