import type { ReactElement } from 'react';

/**
 * Single-colour icons for the site's feature and value cards.
 *
 * Drawn the way the home page marks are drawn: one flat colour, with every
 * distinction made by negative space rather than by a second tone. A book is
 * two shapes with a gap down the middle; an eye is a lens with the pupil taken
 * out of it.
 *
 * That is why each icon is painted through a mask instead of as a stack of
 * filled shapes. In the mask, `S` adds and `H` takes away, in the order they
 * are written — so a detail sitting on top of a body becomes a hole in it, and
 * `SEP` (a hole-coloured stroke straddling an outline) opens a hairline gap
 * between two shapes that would otherwise merge into one blob. Painting the
 * colour once through that mask is what keeps the whole icon a single tone.
 *
 * The geometry is worked out rather than eyeballed, because at this size the
 * failures are structural: a head that does not meet its shoulders reads as two
 * objects, and two overlapping circles only become a heart once the notch
 * between them is deep enough to see.
 */

/** In the mask: white adds to the shape, black cuts into it. */
const S = '#fff';
const H = '#000';

/** A hole-coloured outline, which opens a gap around whatever it is put on. */
const SEP = { stroke: H, strokeWidth: 1.5 } as const;

const ART: Record<string, ReactElement> = {
  // Mission — an arrow already in the target.
  mission: (
    <>
      <circle cx="15" cy="18" r="12" fill={S} />
      <circle cx="15" cy="18" r="7.6" fill={H} />
      <circle cx="15" cy="18" r="3.1" fill={S} />
      <path d="M30.4 2.6 17.2 15.8" fill="none" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M26.6 1.4 31.6 1.4 31.6 6.4Z" fill={S} />
    </>
  ),

  // Vision — a lens with the pupil taken out of it.
  vision: (
    <>
      <path d="M2.5 16Q16 1 29.5 16 16 31 2.5 16Z" fill={S} />
      <circle cx="16" cy="16" r="5.2" fill={H} />
      <circle cx="16" cy="16" r="2.6" fill={S} />
    </>
  ),

  // Access — a padlock standing open.
  access: (
    <>
      <path d="M19.4 14.4V10.4a4.8 4.8 0 0 1 9.6 0v3.4" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" />
      <rect x="6.6" y="13.8" width="18" height="15.2" rx="3.4" fill={S} />
      <circle cx="15.6" cy="19.6" r="2.4" fill={H} />
      <rect x="14.6" y="20.8" width="2" height="4.4" rx="1" fill={H} />
      <path d="M6.6 8.6a7 7 0 0 1 3-4.6M11.8 6.2a6 6 0 0 1 2.4-2.8" fill="none" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),

  // Mentorship — someone older, someone younger, a gap between them.
  mentorship: (
    <>
      <path d="M8.6 5.4Q16 1.2 23.6 6.6" fill="none" stroke={S} strokeWidth="1.9" strokeLinecap="round" strokeDasharray="0.2 4.2" />
      <circle cx="11" cy="11.6" r="4.3" fill={S} />
      <path d="M3.1 29v-5.8a7.9 7.9 0 0 1 15.8 0V29Z" fill={S} />
      <circle cx="23.4" cy="14.6" r="3.3" fill={S} {...SEP} />
      <path d="M17.3 29v-5.2a6.1 6.1 0 0 1 12.2 0V29Z" fill={S} {...SEP} />
    </>
  ),

  // Innovation — a lit bulb: the filament is cut out of the glass.
  innovation: (
    <>
      <path d="M16 1.4v3M6.2 5.4l2.2 2.2M25.8 5.4l-2.2 2.2M1.6 14.4h3M30.4 14.4h-3" fill="none" stroke={S} strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="16" cy="14.4" r="7.4" fill={S} />
      <path d="M12.9 15.4 15 12.2l1.6 2.6 2.1-3" fill="none" stroke={H} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.7" y="21.8" width="8.6" height="2.6" rx="1.3" fill={S} {...SEP} />
      <rect x="12.7" y="25.4" width="6.6" height="2.6" rx="1.3" fill={S} {...SEP} />
      <rect x="13.7" y="29" width="4.6" height="2" rx="1" fill={S} {...SEP} />
    </>
  ),

  // Something wrong, stated plainly.
  problem: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <rect x="14.3" y="7.2" width="3.4" height="11.4" rx="1.7" fill={H} />
      <circle cx="16" cy="23.4" r="2" fill={H} />
    </>
  ),

  // And the answer to it.
  response: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <path d="M9.8 16h9.6" fill="none" stroke={H} strokeWidth="2.9" strokeLinecap="round" />
      <path d="M17.2 10.9 23.2 16l-6 5.1Z" fill={H} />
    </>
  ),

  // A place.
  place: (
    <>
      <ellipse cx="16" cy="29.6" rx="4.6" ry="1.4" fill={S} {...SEP} />
      <circle cx="16" cy="12.6" r="8" fill={S} />
      <path d="M8.7 16.2h14.6L16 27.8Z" fill={S} />
      <circle cx="16" cy="12.4" r="3.4" fill={H} />
    </>
  ),

  // Where somebody lives.
  home: (
    <>
      <path d="M16 2.8 30.4 15.2H1.6Z" fill={S} />
      <rect x="5.4" y="14.6" width="21.2" height="14.6" rx="2.2" fill={S} />
      <rect x="12.9" y="19.8" width="6.2" height="9.4" rx="1.4" fill={H} />
    </>
  ),

  // Everywhere else.
  globe: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <path d="M3.2 16h25.6" fill="none" stroke={H} strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="16" cy="16" rx="5.6" ry="12.9" fill="none" stroke={H} strokeWidth="2.2" />
    </>
  ),

  // Write to us.
  mail: (
    <>
      <rect x="2.8" y="7.4" width="26.4" height="18.2" rx="3" fill={S} />
      <path d="M5.4 10.6 16 18.6l10.6-8" fill="none" stroke={H} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // Or call.
  phone: (
    <>
      <rect x="8.4" y="2.4" width="15.2" height="27.2" rx="3.4" fill={S} />
      <rect x="10.9" y="6.2" width="10.2" height="17.4" rx="1.6" fill={H} />
      <circle cx="16" cy="26.6" r="1.6" fill={H} />
    </>
  ),

  // Work.
  work: (
    <>
      <path d="M12 10.8V8.2a2.7 2.7 0 0 1 2.7-2.7h2.6A2.7 2.7 0 0 1 20 8.2v2.6" fill="none" stroke={S} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="3.2" y="10.4" width="25.6" height="17.4" rx="3" fill={S} />
      <rect x="13.5" y="16.9" width="5" height="3.6" rx="1.2" fill={H} />
    </>
  ),

  // Done.
  done: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <path d="m9.4 16.4 4.7 4.7 8.5-8.9" fill="none" stroke={H} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // People, plural — gaps keep them three.
  people: (
    <>
      <circle cx="16" cy="8.4" r="3.4" fill={S} />
      <path d="M10.4 20.8v-3.8a5.6 5.6 0 0 1 11.2 0v3.8Z" fill={S} />
      <circle cx="7.4" cy="13.8" r="3.6" fill={S} {...SEP} />
      <path d="M1.4 29v-5.8a6 6 0 0 1 12 0V29Z" fill={S} {...SEP} />
      <circle cx="24.6" cy="13.8" r="3.6" fill={S} {...SEP} />
      <path d="M18.6 29v-5.8a6 6 0 0 1 12 0V29Z" fill={S} {...SEP} />
    </>
  ),

  // A medal.
  award: (
    <>
      <path d="M9.6 2.2h4.8L18 9.8l-4 2.4-5-6.4Z" fill={S} />
      <path d="M22.4 2.2h-4.8L14 9.8l4 2.4 5-6.4Z" fill={S} />
      <circle cx="16" cy="20.6" r="9.4" fill={S} {...SEP} />
      <path d="M16 15.8 17.18 18.98 20.57 19.12 17.9 21.22 18.82 24.48 16 22.6 13.18 24.48 14.1 21.22 11.43 19.12 14.82 18.98Z" fill={H} />
    </>
  ),

  // Things stacked, with air between them.
  layers: (
    <>
      <path d="M16 2.4 29.4 9.4 16 16.4 2.6 9.4Z" fill={S} />
      <path d="M16 10.6 29.4 17.6 16 24.6 2.6 17.6Z" fill={S} {...SEP} />
      <path d="M16 18.8 29.4 25.8 16 32.8 2.6 25.8Z" fill={S} {...SEP} />
    </>
  ),

  // An open book, the spine taken out of it.
  book: (
    <>
      <path d="M15.2 8.6C12.4 6.2 8 5.2 3 5.6v18.8c5-.4 9.4.6 12.2 3Z" fill={S} />
      <path d="M16.8 8.6C19.6 6.2 24 5.2 29 5.6v18.8c-5-.4-9.4.6-12.2 3Z" fill={S} />
      <rect x="14.6" y="7" width="2.8" height="21.6" rx="1.4" fill={H} />
    </>
  ),

  // Going up. The arrow clears every bar.
  growth: (
    <>
      <rect x="2.6" y="19.8" width="5.6" height="9.4" rx="1.6" fill={S} />
      <rect x="13.2" y="14.8" width="5.6" height="14.4" rx="1.6" fill={S} />
      <rect x="23.8" y="9.6" width="5.6" height="19.6" rx="1.6" fill={S} />
      <path d="M4 14.2 11.6 8.2l5.6 3.6L25.6 3.6" fill="none" stroke={S} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.6 2.6h8.8v8.4Z" fill={S} />
    </>
  ),

  // Finding the way.
  compass: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <path d="M22.2 9.8 18.8 18.8 9.8 22.2 13.2 13.2Z" fill={H} />
      <circle cx="16" cy="16" r="1.6" fill={S} />
    </>
  ),

  // Making and mending.
  tools: (
    <>
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(0 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(45 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(90 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(135 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(180 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(225 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(270 16 16)" />
      <rect x="14.6" y="1.5" width="2.8" height="5.8" rx="1.4" fill={S} transform="rotate(315 16 16)" />
      <circle cx="16" cy="16" r="10.4" fill={S} />
      <circle cx="16" cy="16" r="4.6" fill={H} />
    </>
  ),

  // A stack of coins, kept apart.
  money: (
    <>
      <ellipse cx="16" cy="25.8" rx="10.6" ry="3.9" fill={S} />
      <ellipse cx="16" cy="20.2" rx="10.6" ry="3.9" fill={S} {...SEP} />
      <ellipse cx="16" cy="14.6" rx="10.6" ry="3.9" fill={S} {...SEP} />
      <circle cx="27.4" cy="5.6" r="1.8" fill={S} />
      <circle cx="22.4" cy="2.8" r="1.1" fill={S} />
    </>
  ),

  // The part that does the thinking.
  chip: (
    <>
      <path d="M10.6 2.6v4M16 2.6v4M21.4 2.6v4M10.6 25.4v4M16 25.4v4M21.4 25.4v4M2.6 10.6h4M2.6 16h4M2.6 21.4h4M25.4 10.6h4M25.4 16h4M25.4 21.4h4" fill="none" stroke={S} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="6.4" y="6.4" width="19.2" height="19.2" rx="3.2" fill={S} />
      <rect x="11.4" y="11.4" width="9.2" height="9.2" rx="2" fill={H} />
    </>
  ),

  // Something given.
  gift: (
    <>
      <circle cx="12.4" cy="6.6" r="3.6" fill={S} />
      <circle cx="19.6" cy="6.6" r="3.6" fill={S} />
      <rect x="2.6" y="9.2" width="26.8" height="5.8" rx="2" fill={S} />
      <rect x="4.4" y="15" width="23.2" height="14.4" rx="2.4" fill={S} />
      <rect x="14.2" y="9.2" width="3.6" height="20.2" fill={H} />
    </>
  ),

  // A marker planted.
  flag: (
    <>
      <rect x="5" y="2.4" width="3.2" height="27.2" rx="1.6" fill={S} />
      <path d="M9.4 4.6h17.2l-4.4 5.8 4.4 5.8H9.4Z" fill={S} {...SEP} />
    </>
  ),

  // Measuring.
  measure: (
    <>
      <rect x="12.4" y="2.6" width="7.2" height="18.6" rx="3.6" fill={S} />
      <circle cx="16" cy="24.4" r="5.6" fill={S} />
      <rect x="14.6" y="9.6" width="2.8" height="13" rx="1.4" fill={H} />
      <path d="M21.8 8h3.6M21.8 12.4h2.4M21.8 16.8h3.6" fill="none" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),

  // Writing it.
  code: (
    <>
      <rect x="2.4" y="4.6" width="27.2" height="22.8" rx="3.2" fill={S} />
      <path d="m12 12.6-4.4 4.4 4.4 4.4M20 12.6l4.4 4.4-4.4 4.4" fill="none" stroke={H} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // Sending it somewhere.
  send: (
    <>
      <path d="M29.4 3.2 2.6 13.4l10.2 4.2Z" fill={S} />
      <path d="M29.4 3.2 18.6 29.4l-3.6-10.6Z" fill={S} {...SEP} />
    </>
  ),

  // Setting it up.
  settings: (
    <>
      <path d="M5.4 7.4h21.2M5.4 16h21.2M5.4 24.6h21.2" fill="none" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="11.4" cy="7.4" r="4" fill={S} {...SEP} />
      <circle cx="21.2" cy="16" r="4" fill={S} {...SEP} />
      <circle cx="13.6" cy="24.6" r="4" fill={S} {...SEP} />
    </>
  ),

  // On a screen.
  screen: (
    <>
      <rect x="2.4" y="4.4" width="27.2" height="19.2" rx="3" fill={S} />
      <rect x="6.6" y="8.4" width="18.8" height="11.2" rx="1.6" fill={H} />
      <rect x="11.4" y="26.4" width="9.2" height="2.8" rx="1.4" fill={S} />
    </>
  ),

  // Numbers.
  maths: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <circle cx="16" cy="9.4" r="2.4" fill={H} />
      <path d="M8.6 16h14.8" fill="none" stroke={H} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="16" cy="22.6" r="2.4" fill={H} />
    </>
  ),

  // Somebody glad to be there.
  joy: (
    <>
      <circle cx="16" cy="16" r="13" fill={S} />
      <circle cx="11.4" cy="12.8" r="2.2" fill={H} />
      <circle cx="20.6" cy="12.8" r="2.2" fill={H} />
      <path d="M9.8 19.2a6.8 6.8 0 0 0 12.4 0" fill="none" stroke={H} strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),

  // Looking into it.
  search: (
    <>
      <path d="m21 21 7.4 7.4" fill="none" stroke={S} strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="13.4" cy="13.4" r="10.6" fill={S} />
      <circle cx="13.4" cy="13.4" r="5.6" fill={H} />
    </>
  ),

  // Water.
  water: (
    <>
      <path d="M16 2.4c6 7.2 9.2 12 9.2 15.8a9.2 9.2 0 0 1-18.4 0c0-3.8 3.2-8.6 9.2-15.8Z" fill={S} />
      <path d="M11.6 18.4a4.4 4.4 0 0 0 4.4 4.4" fill="none" stroke={H} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),

  // Saying it out loud.
  voice: (
    <>
      <rect x="12.2" y="2.4" width="7.6" height="15.2" rx="3.8" fill={S} />
      <path d="M7.4 15.4a8.6 8.6 0 0 0 17.2 0" fill="none" stroke={S} strokeWidth="2.7" strokeLinecap="round" />
      <rect x="14.6" y="23.4" width="2.8" height="6.2" rx="1.4" fill={S} />
      <rect x="9.6" y="27.6" width="12.8" height="2.8" rx="1.4" fill={S} />
    </>
  ),

  // Kept safe.
  shield: (
    <>
      <path d="M16 2.4 28 6.8v9.4c0 7-5 11.6-12 13.4-7-1.8-12-6.4-12-13.4V6.8Z" fill={S} />
      <path d="m10.4 16.2 4 4 7.4-7.8" fill="none" stroke={H} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // A heart held out on an open palm.
  service: (
    <>
      <circle cx="11.6" cy="11.4" r="5.2" fill={S} />
      <circle cx="20.4" cy="11.4" r="5.2" fill={S} />
      <path d="M6.4 12.6h19.2L16 23.6Z" fill={S} />
      <path d="M3.2 25h25.6a12.8 6.2 0 0 1-25.6 0Z" fill={S} {...SEP} />
    </>
  ),

  /*
   * The countries the Foundation works in, traced from the outlines in
   * public/icons/maps. Those files are one 800x600 path of tens of thousands
   * of points — 472 KB for the United States alone, absurd for something drawn
   * at 56 pixels — so each is reduced here with Ramer-Douglas-Peucker and its
   * offshore scraps dropped: the silhouette, at about one percent of the
   * weight. The outlines are Vemaps' work and are credited beside the section
   * that uses them.
   */
  'uganda': <path d="M6.80 28.42L6.11 28.42L6.01 28.78L5.47 29.40L5.24 29.49L5.14 29.84L3.97 30.50L3.79 30.39L3.70 29.97L3.51 29.73L3.25 29.95L3.05 29.85L2.25 30.06L2.13 27.72L2.41 27.39L2.46 26.04L2.63 25.87L2.51 25.24L2.94 23.03L2.88 22.62L3.18 22.12L3.36 22.15L3.58 21.17L4.09 20.46L3.98 19.85L4.13 18.80L5.18 18.37L5.48 17.91L5.49 17.51L5.77 17.05L6.04 17.11L6.25 16.87L6.83 16.69L6.98 16.80L6.87 16.89L6.93 17.73L7.12 17.61L7.11 17.83L7.22 17.68L7.47 17.74L7.40 17.68L8.03 17.01L8.11 16.68L9.21 15.27L9.67 15.07L9.74 14.92L10.05 14.96L10.42 14.78L10.99 14.28L11.17 13.66L11.31 13.71L11.49 13.51L11.54 12.52L11.31 11.52L11.87 11.10L11.90 10.73L11.83 10.98L11.35 11.23L10.85 11.95L10.45 11.68L10.39 11.27L9.76 11.33L9.32 10.75L9.13 10.75L8.83 11.12L8.57 10.90L8.49 10.60L8.01 10.55L8.14 9.79L8.74 8.47L8.69 8.06L8.18 7.44L8.49 6.47L9.03 5.71L8.96 5.07L8.67 5.22L9.20 4.26L10.20 3.72L10.58 3.68L12.15 4.37L12.36 4.20L12.98 4.09L13.44 3.56L14.07 4.13L14.22 4.67L14.73 4.73L14.96 5.00L15.43 5.11L15.53 4.56L16.46 3.99L18.42 3.80L19.65 3.20L20.50 3.83L22.16 3.90L24.63 1.50L24.78 1.57L25.10 2.17L25.06 2.58L25.29 2.83L25.18 3.25L25.79 3.26L25.51 3.53L25.66 3.66L25.53 3.77L25.98 3.72L26.17 4.10L26.46 3.97L26.99 4.32L26.96 5.04L26.69 5.29L26.96 6.79L27.47 7.12L27.67 7.99L27.96 8.38L28.08 8.45L28.24 8.33L28.50 8.51L28.92 9.77L29.15 9.73L29.45 10.38L29.12 10.84L29.67 12.29L29.65 12.93L29.87 13.24L29.74 13.47L29.70 14.57L29.50 14.97L29.12 15.27L29.02 15.68L28.71 15.93L28.87 16.52L28.81 16.72L28.23 16.84L27.70 17.13L27.61 17.43L27.23 17.48L26.72 18.84L26.27 19.13L26.03 19.66L25.42 20.08L25.13 20.84L25.14 21.29L24.21 22.11L23.89 21.93L23.82 22.21L23.68 21.79L23.61 22.04L23.27 21.97L23.44 21.65L23.20 21.65L23.23 21.55L23.51 21.41L23.27 21.30L22.81 21.41L22.85 21.74L22.54 22.06L22.39 21.97L22.29 22.07L22.36 21.86L22.22 22.00L22.17 21.79L22.12 22.04L21.70 21.48L22.18 21.62L22.25 21.46L22.05 21.20L21.77 21.23L21.84 21.34L21.49 21.27L21.52 21.09L21.28 21.20L21.24 21.05L21.52 20.92L21.44 20.85L21.64 20.53L21.52 20.46L21.28 20.77L21.14 20.76L21.10 20.54L20.89 20.64L20.86 20.82L20.61 20.81L21.03 21.09L20.44 21.38L20.51 21.65L20.30 21.89L20.29 21.74L20.02 21.65L19.88 21.83L20.20 21.86L20.13 22.05L19.59 22.48L19.16 22.60L19.01 22.35L19.15 22.24L19.12 22.00L18.91 22.07L18.94 22.24L18.70 22.17L18.63 22.45L18.42 22.35L17.96 22.53L17.90 22.31L18.35 22.11L18.21 21.93L18.09 22.14L17.94 22.12L18.04 21.86L17.87 21.82L17.97 21.58L17.86 21.51L17.71 21.92L17.44 22.03L17.62 22.28L17.48 22.31L17.56 22.44L17.37 22.39L17.41 22.77L17.27 22.60L17.16 22.73L17.10 22.56L16.80 22.82L16.71 22.71L16.90 22.51L16.85 22.39L16.72 22.57L16.43 22.56L16.50 23.12L15.87 22.73L16.05 23.08L15.80 23.10L15.63 22.80L15.53 23.34L14.65 23.22L14.93 23.50L14.55 23.43L14.16 23.68L14.27 23.71L14.20 23.99L14.47 23.96L14.44 24.17L14.60 24.25L14.76 24.65L14.56 24.59L14.20 25.14L13.79 25.39L13.52 25.92L13.55 26.31L13.04 27.06L13.05 27.26L13.40 27.39L13.47 28.10L8.35 28.01L7.64 28.46Z" fill={S} />,
  'south-sudan': <path d="M30.50 24.06L30.16 24.06L30.15 23.92L30.05 23.91L29.96 24.14L29.74 24.06L29.52 23.67L29.64 23.36L29.21 23.31L29.25 23.05L28.88 23.25L28.84 23.17L26.71 24.06L24.52 26.21L23.72 26.18L23.30 25.88L22.71 26.16L21.77 26.26L21.31 26.53L21.26 26.80L20.68 26.58L20.61 26.32L20.30 26.05L20.08 26.30L19.68 26.44L19.12 26.15L18.74 26.12L18.25 26.38L17.99 26.85L17.99 26.67L17.77 26.39L17.29 26.57L17.22 25.92L16.39 25.70L16.23 25.34L15.74 24.99L15.76 24.83L15.41 24.68L15.43 24.22L14.78 23.96L14.59 23.94L14.43 24.37L14.01 24.75L13.43 24.37L12.95 24.39L12.87 24.23L12.38 24.67L11.89 24.89L11.75 24.72L11.44 24.74L11.26 24.50L11.13 24.56L11.04 24.24L10.64 24.23L10.45 24.12L10.40 23.67L10.23 23.62L10.12 23.39L9.81 23.32L9.62 23.09L9.63 22.95L9.20 22.48L9.08 22.07L9.19 21.70L9.08 21.68L9.08 21.53L8.85 21.22L8.63 21.18L8.50 21.00L8.10 20.91L7.99 20.70L7.42 20.58L7.27 20.39L7.13 20.47L7.34 20.14L6.80 19.69L6.75 19.50L7.01 19.03L6.31 18.60L6.15 18.18L4.51 17.34L4.40 17.14L4.09 16.93L4.03 16.74L4.31 16.54L4.16 16.03L3.77 15.95L3.13 15.24L2.42 15.18L2.22 15.02L1.98 15.08L1.54 14.90L1.50 14.60L1.78 14.25L1.68 14.13L1.74 14.00L1.60 13.93L2.10 13.59L2.54 13.49L2.54 13.20L2.79 12.76L2.84 12.27L3.11 11.91L3.12 11.16L3.57 10.79L3.81 9.99L5.66 9.66L5.82 9.83L5.85 10.26L6.11 10.40L6.34 10.74L6.53 10.81L7.62 12.01L8.74 11.69L10.75 11.72L11.12 12.38L13.08 12.39L13.05 12.14L13.26 11.88L13.79 11.54L14.66 11.30L14.98 10.92L14.98 10.56L15.96 10.03L17.12 10.78L17.81 11.40L18.79 11.30L18.97 11.23L20.03 10.17L20.52 9.53L20.71 9.07L21.91 8.00L21.71 7.43L21.71 6.44L21.05 5.69L22.69 5.69L22.65 5.15L23.83 5.16L23.64 6.48L23.52 6.70L23.76 8.60L23.66 8.86L24.25 9.09L25.57 10.27L25.69 10.59L25.71 11.07L25.54 11.43L25.48 11.96L25.53 12.07L25.95 12.07L26.05 14.13L25.70 14.58L25.16 14.78L25.02 14.76L24.84 14.55L23.89 14.56L23.71 14.79L23.82 15.06L23.73 15.18L23.77 15.34L23.60 15.43L23.29 15.90L23.46 16.19L23.89 16.23L24.17 16.39L24.45 16.31L25.07 16.54L25.79 17.16L25.86 17.55L26.10 17.77L26.22 17.76L26.26 18.01L26.46 18.22L27.01 18.45L27.06 18.79L27.50 18.96L27.85 20.04L28.13 20.50L28.17 20.99L28.48 21.59L28.88 21.86L28.94 22.20L29.08 22.25L29.39 22.06L30.21 22.34L30.08 23.48Z" fill={S} />,
  'usa': <path d="M19.35 9.36L18.79 9.66L18.20 10.26L18.26 10.33L18.79 10.11L18.75 10.37L19.00 10.38L19.84 9.86L19.94 10.17L20.09 10.02L20.02 10.12L20.26 10.06L20.48 10.30L20.72 10.32L21.63 10.00L21.61 10.20L22.05 10.13L22.01 10.36L22.20 10.47L21.83 10.49L21.81 10.63L21.40 10.50L21.06 10.64L20.91 10.90L20.93 10.71L20.74 10.86L20.71 10.70L20.35 11.44L20.30 11.71L20.61 11.50L20.42 12.60L20.53 13.31L20.84 13.72L21.15 13.51L21.30 13.07L21.25 12.51L21.08 12.28L21.15 11.53L21.45 11.12L21.50 11.43L21.54 11.06L21.76 10.94L21.69 10.70L22.52 10.95L22.63 11.59L22.38 12.06L22.52 12.13L22.63 11.89L22.92 11.78L23.22 12.47L22.80 13.42L23.36 13.58L24.73 12.68L25.02 12.32L24.87 12.00L25.92 11.81L26.24 11.54L26.26 11.21L26.10 11.15L26.67 10.40L28.31 9.99L28.34 9.78L28.56 9.76L28.91 8.05L29.12 8.19L29.36 7.99L29.64 8.11L29.92 9.02L30.12 9.04L30.17 9.27L30.50 9.50L30.09 9.99L29.85 9.94L29.87 10.12L29.68 9.94L29.62 10.40L29.51 10.35L29.47 10.53L29.44 10.40L29.45 10.55L29.39 10.41L29.38 10.61L29.31 10.41L29.36 10.66L29.24 10.57L29.14 10.75L29.01 11.39L29.18 11.48L29.02 11.76L29.48 12.07L29.63 11.96L29.54 11.80L29.69 12.04L29.36 12.25L29.29 12.10L29.10 12.35L29.08 12.12L29.03 12.24L28.93 12.14L28.96 12.47L28.26 12.69L27.89 13.14L27.72 12.83L27.81 13.07L27.69 13.41L27.85 13.41L27.90 13.88L27.80 14.21L27.59 14.57L27.57 14.39L27.17 14.17L27.38 13.83L27.14 14.15L27.62 14.93L27.33 15.93L27.37 15.32L27.25 15.35L27.20 15.03L27.12 15.18L26.93 15.04L27.10 14.91L26.89 14.91L26.99 14.74L26.85 14.79L27.03 14.22L26.66 14.53L26.91 15.11L26.71 14.94L26.74 15.07L26.99 15.34L26.55 15.11L26.45 15.20L26.47 14.83L26.41 15.24L26.56 15.17L27.05 15.43L26.95 15.62L26.54 15.34L27.08 15.66L27.01 15.91L26.81 15.76L27.16 16.00L26.58 15.94L26.93 15.97L27.05 16.17L27.33 16.07L27.76 16.79L27.39 16.21L27.57 16.63L27.31 16.51L27.41 16.60L27.18 16.62L27.28 16.68L27.15 16.77L27.02 16.57L27.07 16.83L27.44 16.73L27.50 16.95L27.55 16.71L27.64 16.79L27.48 17.18L26.95 17.15L27.31 17.27L27.19 17.49L26.99 17.41L27.09 17.52L27.35 17.40L27.44 17.52L26.93 17.85L26.85 17.73L26.91 17.88L26.67 18.36L26.63 18.18L26.63 18.39L26.23 18.55L25.96 19.14L25.66 19.31L25.66 19.48L25.28 19.61L25.42 19.73L25.17 19.61L25.31 19.82L24.93 20.48L25.07 20.54L24.96 20.84L25.20 21.48L25.82 22.38L25.94 22.79L25.76 22.30L25.59 22.20L25.68 22.42L26.31 23.47L26.38 24.19L26.25 24.63L25.83 24.73L25.79 24.58L25.94 24.63L25.60 24.28L25.35 24.25L25.12 23.89L25.24 23.71L25.10 23.86L25.09 23.54L24.89 23.67L24.57 23.25L24.72 22.94L24.54 22.88L24.56 23.15L24.47 23.04L24.50 22.29L23.77 21.67L23.43 21.58L23.35 21.74L22.78 21.96L22.55 21.66L22.72 21.70L22.52 21.62L22.59 21.52L22.43 21.58L22.52 21.67L22.03 21.53L22.27 21.52L22.20 21.44L21.62 21.60L21.80 21.53L21.70 21.42L21.54 21.63L21.42 21.67L21.47 21.53L21.13 21.74L21.28 21.69L21.10 21.38L21.06 21.68L20.57 21.63L20.19 21.86L19.82 21.72L19.68 21.87L19.85 21.97L20.14 21.85L20.04 21.97L20.16 22.05L20.33 21.92L20.28 22.22L20.11 22.23L20.59 22.51L20.35 22.70L20.43 22.54L19.86 22.28L19.97 22.47L19.85 22.62L19.71 22.44L19.56 22.62L19.20 22.54L19.30 22.53L19.22 22.30L19.02 22.35L18.84 22.16L18.56 22.38L17.63 22.29L17.61 22.09L17.61 22.31L17.07 22.53L17.24 22.39L16.89 22.27L17.03 22.53L16.83 22.76L16.18 23.15L16.32 23.04L15.91 22.98L16.06 23.18L15.91 23.26L15.82 23.15L15.77 23.38L15.59 23.37L15.58 23.60L15.37 23.57L15.53 23.69L15.43 23.94L15.21 23.85L15.21 23.98L15.42 23.99L15.33 24.28L15.59 24.83L15.41 24.97L14.35 24.55L14.12 23.73L13.03 22.16L12.48 22.04L11.84 22.62L11.14 22.10L10.95 21.42L10.14 20.53L9.09 20.39L9.05 20.70L7.41 20.46L5.33 19.25L5.41 19.12L4.01 18.95L3.92 18.35L3.47 17.95L3.46 17.75L2.37 17.08L2.47 16.69L2.00 15.71L2.15 15.36L1.92 15.09L1.91 14.78L2.02 14.61L2.15 14.90L2.08 14.48L2.56 14.62L2.09 14.38L1.96 14.59L1.73 14.39L1.80 14.23L1.85 14.35L1.55 13.66L1.67 13.02L1.50 12.66L1.91 11.84L1.93 10.90L2.35 10.38L2.89 8.70L3.27 8.85L2.87 8.67L2.96 8.41L2.95 8.61L3.10 8.44L2.98 8.24L3.13 8.25L2.96 8.22L3.01 7.17L3.77 7.68L3.84 7.60L3.86 7.79L3.51 8.07L3.67 8.06L3.54 8.04L3.88 7.75L3.91 7.89L3.77 8.21L3.76 8.11L3.65 8.24L3.68 8.09L3.51 8.23L3.57 8.31L3.89 8.18L4.08 7.75L3.94 7.42L4.08 7.35L4.01 7.03L7.54 7.90L11.18 8.48L15.98 8.78L16.70 8.78L16.79 8.52L16.93 8.92L17.36 9.09L17.73 9.01L18.41 9.38L18.73 9.24ZM5.92 21.24L5.95 23.54L6.17 23.52L6.37 23.85L6.63 23.65L7.11 24.32L7.34 24.40L7.34 24.68L7.22 24.41L7.09 24.55L7.16 24.40L6.88 24.21L6.92 24.05L6.62 23.70L6.67 23.98L6.42 23.81L6.48 24.00L6.09 23.71L6.12 23.59L5.57 23.60L5.53 23.44L5.38 23.49L5.18 23.29L5.08 23.59L4.68 23.74L4.75 23.39L5.03 23.38L4.99 23.22L4.55 23.46L4.38 23.71L4.49 23.79L3.76 24.34L3.09 24.48L3.94 24.03L4.08 23.67L3.89 23.76L3.88 23.63L3.81 23.80L3.66 23.61L3.47 23.69L3.56 23.20L3.32 23.36L3.16 23.14L3.39 23.15L3.16 22.83L3.43 22.56L3.78 22.57L3.88 22.29L3.32 22.19L3.38 22.04L3.20 21.88L3.64 21.76L3.66 21.89L3.92 21.94L3.83 21.71L4.02 21.88L3.72 21.64L3.51 21.26L3.60 21.15L3.81 21.17L4.06 20.88L4.25 20.84L4.25 20.95L4.24 20.83L4.59 20.68L4.60 20.86L4.70 20.77L5.01 21.01Z" fill={S} />,
};

export type FeatureIconName = keyof typeof ART;

export default function FeatureIcon({
  name,
  className = '',
}: {
  name: FeatureIconName;
  className?: string;
}) {
  const art = ART[name];
  if (!art) return null;

  // Deterministic, so the same icon used twice on a page defines the same mask
  // twice rather than two that could drift apart.
  const maskId = `fi-${name}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
        <rect width="32" height="32" fill="#000" />
        {art}
      </mask>
      {/* One flat colour, painted through the mask. */}
      <rect width="32" height="32" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
