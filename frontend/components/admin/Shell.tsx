import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The three page shapes the dashboard uses, in one place.
 *
 * Taken from the reference designs: list pages are a single wide card on a
 * tinted ground; forms and detail pages are a narrow centred column with a
 * small eyebrow over a large centred title. Keeping them here means every
 * screen picks up a change to the shape, rather than fourteen pages drifting.
 */

/** A list page: one white card holding the title, controls and table. */
export function ListCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl bg-card p-6 shadow-sm sm:p-8', className)}>{children}</div>
  );
}

export function ListHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/**
 * A form or detail page: narrow, centred, with the actions on a bar pinned to
 * the bottom of the viewport so Save is reachable without scrolling to the end
 * of a long record.
 */
export function FormShell({
  backHref,
  backLabel,
  eyebrow,
  title,
  children,
  footer,
  wide = false,
}: {
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** The story editor needs room for its preview; record forms do not. */
  wide?: boolean;
}) {
  return (
    <div className="pb-24">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <div className={cn('mx-auto mt-8', wide ? 'max-w-6xl' : 'max-w-3xl')}>
        <div className="text-center">
          {eyebrow ? <p className="text-sm text-muted-foreground">{eyebrow}</p> : null}
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
        </div>

        <div className="mt-8 rounded-3xl bg-card p-6 shadow-sm sm:p-8">{children}</div>
      </div>

      {footer ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-4 py-3 sm:px-0">
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Detail rows: grey label on the left, the value in bold beside it. */
export function DetailSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      {title ? <h2 className="text-xl font-bold tracking-tight">{title}</h2> : null}
      <dl className="space-y-3.5">{children}</dl>
    </section>
  );
}

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  );
}
