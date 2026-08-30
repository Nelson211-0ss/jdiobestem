'use client';

import { useState } from 'react';

/**
 * A website's own icon, as the row's thumbnail.
 *
 * Taken straight from the site — `https://host/favicon.ico` — rather than
 * through one of the icon services. Those have a better hit rate, but using one
 * would send every grant provider the Foundation is looking at to a third party
 * as a browsing trail, which is a poor trade for a 16-pixel picture.
 *
 * Not every site serves one at that path, so a miss falls back to the initial
 * on a tinted disc. That still gives the row something to recognise, and it
 * looks deliberate rather than broken.
 */
export default function SiteFavicon({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);

  let host = '';
  try {
    host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    host = '';
  }

  const initial = (name.trim()[0] ?? '?').toUpperCase();

  if (!host || failed) {
    return (
      <span
        aria-hidden="true"
        title={host || undefined}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={`https://${host}/favicon.ico`}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      title={host}
      className="h-7 w-7 shrink-0 rounded-md bg-muted object-contain"
    />
  );
}
