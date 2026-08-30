/**
 * Video inside a story.
 *
 * Markdown has no syntax for a video, so an embed is stored in the body as a
 * marker element:
 *
 *     <div data-video="https://www.youtube.com/watch?v=XYZ"></div>
 *
 * HTML inside Markdown is legal and passes through the parser untouched, which
 * means the marker survives a round trip through the editor without a custom
 * dialect nobody else can read. It is also obvious to a human editing the raw
 * body, and if anything downstream fails to understand it, it degrades to
 * nothing visible rather than to broken markup.
 *
 * The player is YouTube's or Vimeo's. The Foundation's audience is often on a
 * slow connection, and serving a 200MB MP4 from object storage to every visitor
 * would be worse for them and for the bill than letting a platform that already
 * has edge servers and adaptive bitrate do it.
 */

/** The id and platform of a video URL, if it is one we can embed. */
export function videoIdFrom(url: string): { platform: 'youtube' | 'vimeo'; id: string } | null {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return null;

  // youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID
  const youtube =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/.exec(
      trimmed
    );
  if (youtube) return { platform: 'youtube', id: youtube[1] };

  // vimeo.com/ID, player.vimeo.com/video/ID
  const vimeo = /vimeo\.com\/(?:video\/)?(\d{6,12})/.exec(trimmed);
  if (vimeo) return { platform: 'vimeo', id: vimeo[1] };

  return null;
}

/** The player URL to put in an iframe, or '' if the link is not embeddable. */
export function embedSrc(url: string): string {
  const found = videoIdFrom(url);
  if (!found) return '';
  return found.platform === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${found.id}`
    : `https://player.vimeo.com/video/${found.id}`;
}

/** A still from the video, for showing the embed in the editor. */
export function posterFor(url: string): string {
  const found = videoIdFrom(url);
  if (found?.platform === 'youtube') {
    return `https://i.ytimg.com/vi/${found.id}/hqdefault.jpg`;
  }
  return '';
}

/** The marker as it is stored in a story body. */
export function videoMarker(url: string): string {
  return `<div data-video="${escapeAttribute(url)}"></div>`;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const MARKER = /<div\s+data-video="([^"]+)"\s*>\s*<\/div>/gi;

/**
 * Swap every marker in rendered HTML for a real player.
 *
 * Runs after the Markdown parser, so the body reaching the page has iframes
 * where the markers were. A marker whose URL is not embeddable becomes a plain
 * link — a story that quietly loses a video is worse than one that shows the
 * address.
 */
export function withVideoEmbeds(html: string): string {
  return html.replace(MARKER, (_match, rawUrl: string) => {
    const url = decodeAttribute(rawUrl);
    const src = embedSrc(url);
    if (!src) {
      return `<p><a href="${rawUrl}" target="_blank" rel="noopener noreferrer">${rawUrl}</a></p>`;
    }
    return (
      `<figure class="story-video">` +
      `<iframe src="${src}" title="Video" loading="lazy" allowfullscreen ` +
      `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` +
      `></iframe>` +
      `</figure>`
    );
  });
}

function decodeAttribute(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}
