'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './Icon';

/**
 * The secondary action row under the donate button — Follow, Share, More — as
 * the reference design has it.
 *
 * Each one does something real rather than standing in for a feature the site
 * does not have. Follow goes to the footer newsletter, which is the only place
 * the foundation actually publishes updates; the social accounts in the footer
 * are still placeholder URLs, so pointing "Follow" at them would send people
 * nowhere. Share uses the Web Share sheet where the browser offers one and
 * falls back to copying the link. More opens the other two ways to help, both
 * of which are real pages.
 */
export default function DonateActions() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const say = (text: string) => {
    setStatus(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), 4000);
  };

  const onShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Donate — Jdiobe STEM Foundation',
          text: 'Help put STEM within reach of students in Uganda and South Sudan.',
          url,
        });
        return;
      } catch (err) {
        // Dismissing the share sheet is not a failure — say nothing and stop.
        if (err instanceof Error && err.name === 'AbortError') return;
        // Anything else falls through to the clipboard.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      say('Link copied.');
    } catch {
      say('Could not copy — the link is in your address bar.');
    }
  };

  const onFollow = () => {
    // The browser handles the scroll via the anchor; this just puts the caret
    // in the field so the next keystroke goes where the click promised.
    window.setTimeout(() => {
      document.getElementById('newsletter-email')?.focus({ preventScroll: true });
    }, 550);
  };

  return (
    <div className="donate-actions-wrap">
      <div className="donate-actions">
        <a href="#newsletter-email" className="donate-action" onClick={onFollow}>
          <Icon name="eye" />
          Follow
        </a>

        <button type="button" className="donate-action" onClick={onShare}>
          <Icon name="share-2" />
          Share
        </button>

        <button
          type="button"
          className="donate-action"
          aria-expanded={moreOpen}
          aria-controls="donate-more"
          onClick={() => setMoreOpen((open) => !open)}
        >
          <Icon name="more-horizontal" />
          More
        </button>
      </div>

      <div id="donate-more" className={moreOpen ? 'donate-more' : 'hidden'}>
        <Link href="/volunteers" className="btn-ghost">
          <Icon name="user-plus" />
          Give time instead
        </Link>
        <Link href="/contact" className="btn-ghost">
          <Icon name="briefcase" />
          Partner with us
        </Link>
      </div>

      <p role="status" aria-live="polite" className={status ? 'donate-actions-status' : 'hidden'}>
        {status}
      </p>
    </div>
  );
}
