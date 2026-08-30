'use client';

import { useState } from 'react';
import { Loader2, Monitor, Smartphone } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The website, shown small beside a form.
 *
 * The desktop view is a fixed two-times zoom-out: the frame is laid out at
 * `200%` of this column and then scaled by a half, so its visible width is
 * exactly the column, whatever the column happens to be — and the page inside
 * believes it has twice the room, which is what keeps it on its desktop layout
 * instead of collapsing to the mobile one.
 *
 * Doing it in percentages rather than pixels is the point. The first version
 * measured the column with a ResizeObserver and scaled by the result; when that
 * measurement was wrong the frame rendered at 41% and sat in the corner of an
 * empty box. Percentages cannot be measured wrongly.
 *
 * The phone view is a real 390px, centred and unscaled — a phone preview that
 * fills a wide column is not a phone preview.
 */

const ZOOM = 0.5;
const VIEWPORT_HEIGHT = 760;

type Device = 'desktop' | 'phone';

export default function PreviewFrame({
  src,
  title,
  frameRef,
  onReady,
}: {
  src: string;
  title: string;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  onReady?: () => void;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  const [loaded, setLoaded] = useState(false);

  const desktop = device === 'desktop';

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          The page, as it would read
        </p>
        <div className="inline-flex rounded-full bg-muted p-0.5">
          {(['desktop', 'phone'] as const).map((option) => {
            const Icon = option === 'desktop' ? Monitor : Smartphone;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={device === option}
                onClick={() => setDevice(option)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  device === option
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {option === 'desktop' ? 'Desktop' : 'Phone'}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl border bg-background"
        style={{ height: VIEWPORT_HEIGHT }}
      >
        {!loaded ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading the page…
          </div>
        ) : null}

        {desktop ? (
          <iframe
            ref={frameRef}
            src={src}
            title={title}
            onLoad={() => {
              setLoaded(true);
              onReady?.();
            }}
            style={{
              // Twice the column, scaled by a half: exactly the column wide.
              width: `${100 / ZOOM}%`,
              // The site caps every iframe at `max-width: 100%`, which clamped
              // the 200% back to the column before the scale halved it — the
              // frame then filled exactly half the box. Undone here, for this
              // frame only, because being wider than its box is the whole
              // mechanism.
              maxWidth: 'none',
              height: VIEWPORT_HEIGHT / ZOOM,
              transform: `scale(${ZOOM})`,
              transformOrigin: 'top left',
              border: 0,
              display: 'block',
            }}
          />
        ) : (
          <div className="flex h-full justify-center bg-muted/30">
            <iframe
              ref={frameRef}
              src={src}
              title={title}
              onLoad={() => {
                setLoaded(true);
                onReady?.();
              }}
              style={{ width: 390, height: VIEWPORT_HEIGHT, border: 0, display: 'block' }}
              className="bg-background shadow-sm"
            />
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {desktop
          ? 'Desktop layout, zoomed out to fit. It scrolls to whatever you are editing.'
          : 'Shown at 390px, the width of a phone.'}
      </p>
    </div>
  );
}
