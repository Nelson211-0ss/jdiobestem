/**
 * Where a file's small copy lives.
 *
 * The backend writes `abc.jpg` and `abc-thumb.webp` side by side and stores
 * only the first. The pairing is a convention rather than a record, so any
 * caller can work out the thumbnail's address from the file's own — and
 * anything uploaded before thumbnails existed simply has no `-thumb.webp`,
 * which is why every use falls back to the original when it 404s.
 */

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;
const PDF_RE = /\.pdf(\?|#|$)/i;

export function isImage(url: string): boolean {
  return IMAGE_RE.test(url);
}

export function isPdf(url: string): boolean {
  return PDF_RE.test(url);
}

/** The small copy, or the original where a small copy cannot exist. */
export function thumbFor(url: string): string {
  if (!url || !isImage(url)) return url;
  if (url.includes('-thumb.webp')) return url;
  return url.replace(/\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i, '-thumb.webp$2');
}

/** A readable file name from a storage URL. */
export function fileNameFrom(url: string): string {
  try {
    return decodeURIComponent(url.split('?')[0].split('/').pop() || url);
  } catch {
    return url;
  }
}

/** The extension, upper-cased, for the chip shown when there is no picture. */
export function extensionOf(url: string): string {
  return (url.split('?')[0].split('.').pop() || 'file').slice(0, 4).toUpperCase();
}
