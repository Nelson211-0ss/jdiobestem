/**
 * Reading a page block, on either side of the wire.
 *
 * `site-content.ts` is marked `server-only` so the site's data loaders can
 * never be pulled into a browser bundle. This one function has no server
 * dependency — it picks a string out of a map — and the preview needs it on the
 * client, so it lives here and `site-content` re-exports it.
 */

/**
 * The wording for `key`, or the text the page ships with.
 *
 * A blank block falls back too, not just a missing one: emptying the box in the
 * dashboard should restore the built-in words rather than leave a hole in the
 * page.
 */
export function text(blocks: Record<string, string>, key: string, fallback: string): string {
  const value = blocks[key];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}
