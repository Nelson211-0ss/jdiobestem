'use client';

import { useEffect, useState } from 'react';

/**
 * Full-screen loader shown until the page's own assets have finished loading.
 *
 * The static build also waited on the header/footer fetches; those are now part
 * of the server-rendered markup, so `load` is the main gate — but it is not a
 * safe one on its own. `load` waits on every subresource including third-party
 * iframes, so a slow or blocked embed (the Google Map on /contact) leaves the
 * overlay up forever with the page unusable behind it. The timeout below is the
 * real guarantee; `load` just makes it quicker in the common case.
 */

/** Longest the overlay may stay up, whatever `load` is doing. */
const MAX_WAIT_MS = 2500;
export default function Preloader() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const hide = () => setHiding(true);
    if (document.readyState === 'complete') {
      hide();
      return;
    }
    const fallback = setTimeout(hide, MAX_WAIT_MS);
    window.addEventListener('load', hide);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener('load', hide);
    };
  }, []);

  useEffect(() => {
    if (!hiding) return;
    // Matches the fade-out duration in brand-colors.css.
    const t = setTimeout(() => setGone(true), 450);
    return () => clearTimeout(t);
  }, [hiding]);

  if (gone) return null;

  return (
    <div
      id="preloader"
      className={`preloader${hiding ? ' is-hidden' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <span className="preloader-spinner">
        <img
          src="/images/partners/preloader/preloader%20icon.png"
          alt=""
          className="preloader-icon"
          width={42}
          height={42}
        />
      </span>
    </div>
  );
}
