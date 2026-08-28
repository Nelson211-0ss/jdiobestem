'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';

/**
 * Home hero.
 *
 * Asymmetric composition on cream: the headline column carries the weight and
 * the carousel sits opposite it, cropped with one squared corner so it reads as
 * a designed block rather than a floating photo. Orange is spent on the sketch
 * underline and the primary button only — the slab of brand colour it replaces
 * left nothing for the CTAs to stand against.
 *
 * Autoplay pauses on a hidden tab, resets on any manual advance, and is skipped
 * entirely under `prefers-reduced-motion`.
 */

const AUTOPLAY_MS = 6500;

const SLIDES = [
  {
    src: '/images/hero-students-community.png',
    alt:
      'Large group of students in school uniforms smiling together on outdoor steps, one holding a small model airplane',
  },
  {
    src: '/images/hero-diy-stem-car.png',
    alt:
      'Close-up of a student-made toy car built from cardboard, foam wheels, tape, and a small motor with a belt drive—a hands-on STEM engineering project',
  },
  {
    src: '/images/hero-science-fair-projects.png',
    alt:
      'Students at an outdoor science fair presenting projects including solar panel placement wiring, microcontrollers, and models on a display table',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const go = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const startTimer = useCallback(() => {
    if (reduceMotion) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setCurrent((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
  }, [reduceMotion]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [startTimer]);

  // Don't burn frames on a backgrounded tab.
  useEffect(() => {
    if (reduceMotion) return;
    const onVisibility = () => {
      if (document.hidden) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
      } else {
        startTimer();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [reduceMotion, startTimer]);

  // Any manual advance restarts the dwell time on the newly shown slide.
  const step = (delta: number) => {
    go(current + delta);
    startTimer();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  };

  return (
    <section className="hero-home relative overflow-hidden bg-cream-100">
      {/* Decorative field, held well back so it never fights the headline. */}
      <div className="hero-blob" aria-hidden="true" />

      <div className="container-page relative z-10 grid items-center gap-12 pb-16 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:pb-24 lg:pt-16">
        <div className="max-w-2xl">
          

          <h1 className="hero-title-in delay-1 mt-4">
            Empowering the next generation of{' '}
            <span className="underline-sketch">STEM leaders</span> in Africa
          </h1>

          <p className="hero-title-in delay-2 lede mt-6">
            The Jdiobe STEM Foundation provides underserved students in Uganda with access to
            education, scholarships, mentorship, and real world STEM opportunities.
          </p>

          <div className="hero-title-in delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/donate" className="btn-primary">
              <Icon name="heart" />
              Sponsor a Student
            </Link>
            <Link href="/contact" className="btn-ghost">
              Partner With Us
            </Link>
          </div>
        </div>

        <div className="hero-title-in delay-2 relative">
          <div
            className="hero-media relative"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured images"
          >
            {SLIDES.map((slide, i) => {
              const active = i === current;
              return (
                <div
                  key={slide.src}
                  className={`hero-slide absolute inset-0 transition-opacity duration-[1100ms] ease-in-out ${
                    active ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  aria-hidden={!active}
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding={i === 0 ? 'sync' : 'async'}
                    fetchPriority={i === 0 ? 'high' : undefined}
                    width={1920}
                    height={1080}
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => step(-1)}
              className="hero-arrow left-3"
              aria-label="Previous image"
            >
              <Icon name="chevron-left" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="hero-arrow right-3"
              aria-label="Next image"
            >
              <Icon name="chevron-right" />
            </button>
          </div>

          <div
            className="mt-5 flex justify-center gap-2 lg:justify-start"
            role="tablist"
            aria-label="Choose slide"
          >
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                onClick={() => {
                  go(i);
                  startTimer();
                }}
                className={`hero-slider-dot ${i === current ? 'is-active' : ''}`}
                aria-label={`Slide ${i + 1}`}
                aria-selected={i === current}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
