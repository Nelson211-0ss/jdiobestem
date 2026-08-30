'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Download, FileText, ImageOff, Loader2, Share2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { extensionOf, fileNameFrom, isImage, isPdf, thumbFor } from '@/lib/media';

/**
 * A file in a table, and the full view behind it.
 *
 * The row shows the small copy — a 20 KB webp rather than the 7 MB photograph
 * it was made from — and the original is fetched only when somebody actually
 * opens it. On a page of twenty receipts that is the difference between 400 KB
 * and 140 MB.
 *
 * The thumbnail falls back to the original if the small copy is missing, which
 * is the case for everything uploaded before thumbnails existed. Nothing had to
 * be migrated for that to work.
 */

export function FileThumb({
  url,
  alt = '',
  className,
  onOpen,
}: {
  url: string;
  alt?: string;
  className?: string;
  onOpen?: () => void;
}) {
  const [src, setSrc] = useState(() => thumbFor(url));

  if (!url) {
    return (
      <span
        className={cn('flex h-11 w-11 items-center justify-center rounded-md bg-muted', className)}
        aria-label="No file"
      >
        <ImageOff className="h-4 w-4 text-muted-foreground" />
      </span>
    );
  }

  if (!isImage(url)) {
    return (
      <button
        type="button"
        onClick={onOpen}
        title={fileNameFrom(url)}
        className={cn(
          'flex h-11 w-11 flex-col items-center justify-center rounded-md bg-muted transition hover:bg-muted/70',
          className,
        )}
      >
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="mt-0.5 text-[0.5625rem] font-semibold tracking-wide text-muted-foreground">
          {extensionOf(url)}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={cn('block', className)} title={fileNameFrom(url)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        // The small copy may not exist for older files; the original always does.
        onError={() => setSrc((current) => (current === url ? current : url))}
        className="h-11 w-11 rounded-md object-cover transition hover:opacity-85"
      />
    </button>
  );
}

/** The full view: the original file, with the two things people want to do with it. */
export function FileLightbox({
  url,
  alt = '',
  onClose,
}: {
  url: string;
  alt?: string;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [shared, setShared] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // The page behind must not scroll under the overlay.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const share = useCallback(async () => {
    const name = fileNameFrom(url);
    // The share sheet where the device offers one; the clipboard everywhere
    // else, because a dead "Share" button is worse than an honest copy.
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared('Link copied');
      setTimeout(() => setShared(''), 3000);
    } catch {
      setShared('Could not copy the link');
      setTimeout(() => setShared(''), 3000);
    }
  }, [url]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || fileNameFrom(url)}
      className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="min-w-0 truncate text-sm font-medium">{fileNameFrom(url)}</p>
        <div className="flex shrink-0 items-center gap-2">
          {shared ? <span className="text-xs text-white/80">{shared}</span> : null}
          <button
            type="button"
            onClick={share}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            Share
          </button>
          <a
            href={url}
            download={fileNameFrom(url)}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-4" onClick={onClose}>
        {isImage(url) ? (
          <>
            {!loaded ? <Loader2 className="h-8 w-8 animate-spin text-white/70" /> : null}
            <img
              src={url}
              alt={alt}
              onLoad={() => setLoaded(true)}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'max-h-full max-w-full rounded-lg object-contain',
                loaded ? 'block' : 'hidden',
              )}
            />
          </>
        ) : isPdf(url) ? (
          <iframe
            title={fileNameFrom(url)}
            src={url}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-full rounded-lg bg-white"
          />
        ) : (
          <div
            className="rounded-lg bg-white p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm">
              This file cannot be shown here. Use Download to open it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Thumbnail plus its full view, for callers that just want the pair. */
export default function FilePreview({
  url,
  alt = '',
  className,
}: {
  url: string;
  alt?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <FileThumb url={url} alt={alt} className={className} onOpen={() => url && setOpen(true)} />
      {open ? <FileLightbox url={url} alt={alt} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
