/**
 * The hand-built pages the Page copy preview can render.
 *
 * A plain module, deliberately: the list is read by a server component to decide
 * whether a preview URL is valid, and anything exported from a `'use client'`
 * file reaches the server as a reference to a client thing rather than as the
 * value itself — an array becomes something you cannot call `.includes` on.
 */
export const PREVIEWABLE_PAGES = [
  'about',
  'aerospace-institute',
  'community-outreach',
  'contact',
  'impact',
  'mentorship',
  'podcast',
  'scholarship',
  'secondary-research',
  'south-sudan',
  'uganda',
  'youth-stem',
] as const;

export type PreviewablePage = (typeof PREVIEWABLE_PAGES)[number];

export function isPreviewable(page: string): boolean {
  return (PREVIEWABLE_PAGES as readonly string[]).includes(page);
}
